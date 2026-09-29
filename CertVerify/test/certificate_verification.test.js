const CertificateVerification = artifacts.require(
    "CertificateVerification"
);

contract("CertificateVerification", (accounts) => {

    let instance;
    const issuer = accounts[0];

    beforeEach(async () => {
        instance = await CertificateVerification.new();
    });

    it("should deploy the contract successfully", async () => {
        assert.ok(instance.address);
    });

    it("should have zero certificates initially", async () => {
        const count = await instance.getCertificateCount();
        assert.equal(count.toString(), "0");
    });

    it("should create a certificate", async () => {

        await instance.addCertificate(
            "CERT-001",
            "Vrushali Deshmukh",
            "B.E. Artificial Intelligence and Machine Learning",
            "2026-09-28",
            { from: issuer }
        );

        const exists = await instance.certificateExists("CERT-001");

        assert.equal(exists, true);
    });

    it("should retrieve certificate details", async () => {

        await instance.addCertificate(
            "CERT-001",
            "Vrushali Deshmukh",
            "B.E. Artificial Intelligence and Machine Learning",
            "2026-09-28",
            { from: issuer }
        );

        const result = await instance.getCertificate("CERT-001");

        assert.equal(result[0], "CERT-001");
        assert.equal(result[1], "Vrushali Deshmukh");
        assert.equal(
            result[2],
            "B.E. Artificial Intelligence and Machine Learning"
        );
        assert.equal(result[3], "2026-09-28");
        assert.equal(result[4], issuer);
        assert.equal(result[5], true);
    });

    it("should reject duplicate certificate IDs", async () => {

        await instance.addCertificate(
            "CERT-001",
            "Student One",
            "B.E. AI & ML",
            "2026-09-28",
            { from: issuer }
        );

        try {

            await instance.addCertificate(
                "CERT-001",
                "Student Two",
                "B.E. AI & ML",
                "2026-09-28",
                { from: issuer }
            );

            assert.fail("Duplicate certificate was accepted");

        } catch (error) {
            assert(
                error.message.includes("Certificate ID already exists")
            );
        }
    });

    it("should return false for a non-existent certificate", async () => {

        const exists =
            await instance.certificateExists("CERT-999");

        assert.equal(exists, false);
    });

    it("should increase certificate count", async () => {

        await instance.addCertificate(
            "CERT-001",
            "Student One",
            "B.E. AI & ML",
            "2026-09-28",
            { from: issuer }
        );

        await instance.addCertificate(
            "CERT-002",
            "Student Two",
            "B.E. AI & ML",
            "2026-09-28",
            { from: issuer }
        );

        const count = await instance.getCertificateCount();

        assert.equal(count.toString(), "2");
    });

});
