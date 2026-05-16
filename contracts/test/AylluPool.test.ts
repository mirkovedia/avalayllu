import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("AylluPool", function () {
  async function deployFixture() {
    const [owner, alice, bob, charlie, diana] = await ethers.getSigners();

    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const usdc = await MockUSDC.deploy();

    const AyniScore = await ethers.getContractFactory("AyniScore");
    const ayniScore = await AyniScore.deploy();

    const AylluPool = await ethers.getContractFactory("AylluPool");
    const pool = await AylluPool.deploy(await usdc.getAddress(), await ayniScore.getAddress());

    // Dar permiso al pool para actualizar scores
    await ayniScore.grantScoreUpdater(await pool.getAddress());

    // Dar USDC a todos los participantes (10,000 USDC cada uno)
    const mintAmount = ethers.parseUnits("10000", 6);
    for (const signer of [alice, bob, charlie, diana]) {
      await usdc.mint(signer.address, mintAmount);
      await usdc.connect(signer).approve(await pool.getAddress(), ethers.MaxUint256);
    }

    return { pool, usdc, ayniScore, owner, alice, bob, charlie, diana };
  }

  describe("Crear Ayllu", function () {
    it("deberia crear un ayllu correctamente", async function () {
      const { pool, alice } = await loadFixture(deployFixture);
      const contribution = ethers.parseUnits("100", 6);
      const roundDuration = 7 * 24 * 60 * 60; // 7 dias

      await expect(
        pool.connect(alice).createAyllu("Familia Ayllu", 4, contribution, roundDuration)
      )
        .to.emit(pool, "AylluCreated")
        .withArgs(0, alice.address, "Familia Ayllu", contribution, 4);

      const ayllu = await pool.getAyllu(0);
      expect(ayllu.name).to.equal("Familia Ayllu");
      expect(ayllu.creator).to.equal(alice.address);
      expect(ayllu.contributionAmount).to.equal(contribution);
      expect(ayllu.maxMembers).to.equal(4);
      expect(ayllu.currentMemberCount).to.equal(1);
      expect(ayllu.status).to.equal(0); // FORMING
    });

    it("deberia rechazar contribucion fuera de rango", async function () {
      const { pool, alice } = await loadFixture(deployFixture);
      const tooLow = ethers.parseUnits("1", 6);
      await expect(
        pool.connect(alice).createAyllu("Test", 4, tooLow, 86400)
      ).to.be.revertedWith("Monto fuera de rango");
    });

    it("deberia rechazar miembros fuera de rango", async function () {
      const { pool, alice } = await loadFixture(deployFixture);
      const contribution = ethers.parseUnits("100", 6);
      await expect(
        pool.connect(alice).createAyllu("Test", 1, contribution, 86400)
      ).to.be.revertedWith("Miembros fuera de rango");
    });
  });

  describe("Unirse a Ayllu", function () {
    it("deberia permitir unirse y activar al llenarse", async function () {
      const { pool, alice, bob, charlie } = await loadFixture(deployFixture);
      const contribution = ethers.parseUnits("100", 6);

      await pool.connect(alice).createAyllu("Test Ayllu", 3, contribution, 3600);

      await expect(pool.connect(bob).joinAyllu(0))
        .to.emit(pool, "MemberJoined")
        .withArgs(0, bob.address, 1);

      // Aun FORMING con 2/3
      let ayllu = await pool.getAyllu(0);
      expect(ayllu.status).to.equal(0); // FORMING

      // Charlie se une — ahora se activa
      await pool.connect(charlie).joinAyllu(0);
      ayllu = await pool.getAyllu(0);
      expect(ayllu.status).to.equal(1); // ACTIVE
      expect(ayllu.currentMemberCount).to.equal(3);
    });

    it("deberia rechazar doble union", async function () {
      const { pool, alice, bob } = await loadFixture(deployFixture);
      const contribution = ethers.parseUnits("100", 6);
      await pool.connect(alice).createAyllu("Test", 3, contribution, 3600);
      await pool.connect(bob).joinAyllu(0);
      await expect(pool.connect(bob).joinAyllu(0)).to.be.revertedWith("Ya eres miembro");
    });
  });

  describe("Contribuir y Distribuir", function () {
    async function activeAylluFixture() {
      const base = await deployFixture();
      const { pool, alice, bob, charlie } = base;
      const contribution = ethers.parseUnits("100", 6);

      await pool.connect(alice).createAyllu("Activo", 3, contribution, 3600);
      await pool.connect(bob).joinAyllu(0);
      await pool.connect(charlie).joinAyllu(0);
      // Ahora el ayllu esta ACTIVE

      return { ...base, contribution };
    }

    it("deberia aceptar contribuciones y distribuir automaticamente", async function () {
      const { pool, usdc, alice, bob, charlie, contribution } = await loadFixture(activeAylluFixture);

      const aliceBalanceBefore = await usdc.balanceOf(alice.address);

      // Ronda 0: Alice recibe
      await pool.connect(alice).contribute(0);
      await pool.connect(bob).contribute(0);
      // Charlie es el ultimo — trigger distribute
      await expect(pool.connect(charlie).contribute(0))
        .to.emit(pool, "PotDistributed");

      const aliceBalanceAfter = await usdc.balanceOf(alice.address);
      // Alice pago 100 USDC pero recibio 300 USDC = +200 neto
      expect(aliceBalanceAfter - aliceBalanceBefore).to.equal(
        contribution * 2n // 300 recibido - 100 pagado = 200 neto
      );

      // Verificar que avanzo a ronda 1
      const ayllu = await pool.getAyllu(0);
      expect(ayllu.currentRound).to.equal(1);
    });

    it("deberia rechazar doble contribucion", async function () {
      const { pool, alice } = await loadFixture(activeAylluFixture);
      await pool.connect(alice).contribute(0);
      await expect(pool.connect(alice).contribute(0)).to.be.revertedWith("Ya contribuiste esta ronda");
    });

    it("deberia completar el ayllu tras todas las rondas", async function () {
      const { pool, alice, bob, charlie } = await loadFixture(activeAylluFixture);

      // Ronda 0
      await pool.connect(alice).contribute(0);
      await pool.connect(bob).contribute(0);
      await pool.connect(charlie).contribute(0);

      // Ronda 1
      await pool.connect(alice).contribute(0);
      await pool.connect(bob).contribute(0);
      await pool.connect(charlie).contribute(0);

      // Ronda 2 — ultima
      await pool.connect(alice).contribute(0);
      await pool.connect(bob).contribute(0);
      await expect(pool.connect(charlie).contribute(0))
        .to.emit(pool, "AylluCompleted")
        .withArgs(0);

      const ayllu = await pool.getAyllu(0);
      expect(ayllu.status).to.equal(2); // COMPLETED
    });
  });

  describe("AyniScore", function () {
    it("deberia actualizar scores tras completar rondas", async function () {
      const { pool, ayniScore, alice, bob, charlie } = await loadFixture(deployFixture);
      const contribution = ethers.parseUnits("100", 6);

      await pool.connect(alice).createAyllu("Score Test", 3, contribution, 3600);
      await pool.connect(bob).joinAyllu(0);
      await pool.connect(charlie).joinAyllu(0);

      // Completar ronda 0
      await pool.connect(alice).contribute(0);
      await pool.connect(bob).contribute(0);
      await pool.connect(charlie).contribute(0);

      // Alice recibio en ronda 0 — deberia tener score > 0
      const aliceScore = await ayniScore.getScore(alice.address);
      expect(aliceScore).to.be.greaterThan(0);
    });
  });

  describe("Cancelar Ayllu", function () {
    it("el creador puede cancelar en estado FORMING", async function () {
      const { pool, alice } = await loadFixture(deployFixture);
      const contribution = ethers.parseUnits("100", 6);
      await pool.connect(alice).createAyllu("Cancelable", 5, contribution, 3600);

      await expect(pool.connect(alice).cancelAyllu(0))
        .to.emit(pool, "AylluCancelled")
        .withArgs(0);

      const ayllu = await pool.getAyllu(0);
      expect(ayllu.status).to.equal(3); // CANCELLED
    });

    it("no se puede cancelar un ayllu activo", async function () {
      const { pool, alice, bob, charlie } = await loadFixture(deployFixture);
      const contribution = ethers.parseUnits("100", 6);
      await pool.connect(alice).createAyllu("No Cancel", 3, contribution, 3600);
      await pool.connect(bob).joinAyllu(0);
      await pool.connect(charlie).joinAyllu(0);

      await expect(pool.connect(alice).cancelAyllu(0))
        .to.be.revertedWith("Solo se puede cancelar en estado FORMING");
    });
  });
});
