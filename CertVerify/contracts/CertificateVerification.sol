// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CertificateVerification {

    address public owner;

    constructor() {
        owner = msg.sender;
    }

    struct Certificate {
        string studentName;
        string courseName;
        string issueDate;
        address issuer;
        bool exists;
    }

    mapping(string => Certificate) private certificates;
    string[] private certificateIds;

    event CertificateAdded(
        string certificateId,
        string studentName,
        string courseName,
        string issueDate,
        address issuer
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can add certificate");
        _;
    }

    function addCertificate(
        string memory _certificateId,
        string memory _studentName,
        string memory _courseName,
        string memory _issueDate
    ) public onlyOwner {

        require(bytes(_certificateId).length > 0, "Certificate ID required");
        require(bytes(_studentName).length > 0, "Student name required");
        require(bytes(_courseName).length > 0, "Course name required");
        require(bytes(_issueDate).length > 0, "Date required");

        require(!certificates[_certificateId].exists, "Already exists");

        certificates[_certificateId] = Certificate(
            _studentName,
            _courseName,
            _issueDate,
            msg.sender,
            true
        );

        certificateIds.push(_certificateId);

        emit CertificateAdded(
            _certificateId,
            _studentName,
            _courseName,
            _issueDate,
            msg.sender
        );
    }

    function getCertificate(
        string memory _certificateId
    )
        public
        view
        returns (
            string memory,
            string memory,
            string memory,
            address,
            bool
        )
    {
        Certificate memory cert = certificates[_certificateId];

        if (!cert.exists) {
            return ("Not Found", "Not Found", "Not Found", address(0), false);
        }

        return (
            cert.studentName,
            cert.courseName,
            cert.issueDate,
            cert.issuer,
            cert.exists
        );
    }

    function certificateExists(
        string memory _certificateId
    ) public view returns (bool) {
        return certificates[_certificateId].exists;
    }

    function getCertificateCount()
        public
        view
        returns (uint256)
    {
        return certificateIds.length;
    }
}