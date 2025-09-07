import { describe, it, expect, beforeEach } from "vitest";

const ERR_NOT_AUTHORIZED = 100;
const ERR_INVALID_ARTIFACT_ID = 101;
const ERR_INVALID_BORROWER = 102;
const ERR_INVALID_DURATION = 103;
const ERR_INVALID_FEE = 104;
const ERR_INVALID_INSURANCE = 105;
const ERR_INVALID_START_TIME = 106;
const ERR_INVALID_END_TIME = 107;
const ERR_INVALID_CONDITION = 108;
const ERR_INVALID_RETURN_ADDRESS = 109;
const ERR_INVALID_ESCROW_AMOUNT = 110;
const ERR_LOAN_ALREADY_EXISTS = 111;
const ERR_LOAN_NOT_FOUND = 112;
const ERR_LOAN_NOT_ACTIVE = 113;
const ERR_LOAN_EXPIRED = 114;
const ERR_INVALID_STATUS = 115;
const ERR_MUSEUM_NOT_VERIFIED = 116;
const ERR_ARTIFACT_NOT_OWNED = 117;
const ERR_ESCROW_NOT_SET = 118;
const ERR_PENALTY_NOT_APPLICABLE = 119;
const ERR_INVALID_PENALTY_AMOUNT = 120;
const ERR_LOAN_NOT_ACCEPTED = 121;
const ERR_LOAN_ALREADY_ACCEPTED = 122;
const ERR_INVALID_TRANSPORT_METHOD = 123;
const ERR_INVALID_VALUATION = 124;
const ERR_INVALID_CURRENCY = 125;
const ERR_MAX_LOANS_EXCEEDED = 126;
const ERR_INVALID_LOAN_TYPE = 127;
const ERR_INVALID_EXTENSION_REQUEST = 128;
const ERR_EXTENSION_NOT_APPROVED = 129;
const ERR_INVALID_DISPUTE_REASON = 130;

interface Loan {
  lender: string;
  borrower: string;
  artifactId: number;
  duration: number;
  fee: number;
  insurance: number;
  startTime: number;
  endTime: number;
  condition: string;
  returnAddress: string;
  escrowAmount: number;
  status: string;
  transportMethod: string;
  valuation: number;
  currency: string;
  loanType: string;
  extensionRequested: boolean;
  extensionDuration: number;
  disputeReason: string;
}

interface LoanUpdate {
  updateDuration: number;
  updateFee: number;
  updateInsurance: number;
  updateTimestamp: number;
  updater: string;
}

class MuseumRegistryMock {
  getMuseumDetails(principal: string): { ok: boolean; value: any } {
    return { ok: true, value: {} };
  }
}

class ArtifactNftMock {
  getOwner(artifactId: number): { ok: boolean; value: string } {
    return { ok: true, value: "ST1LENDER" };
  }
  transfer(artifactId: number, from: string, to: string): { ok: boolean; value: boolean } {
    return { ok: true, value: true };
  }
}

class EscrowManagerMock {
  depositEscrow(loanId: number, amount: number): { ok: boolean; value: boolean } {
    return { ok: true, value: true };
  }
  releaseEscrow(loanId: number, to: string): { ok: boolean; value: boolean } {
    return { ok: true, value: true };
  }
  claimPenalty(loanId: number, penalty: number, to: string): { ok: boolean; value: boolean } {
    return { ok: true, value: true };
  }
}

class DisputeResolutionMock {
  initiateDispute(loanId: number, reason: string): { ok: boolean; value: boolean } {
    return { ok: true, value: true };
  }
}

class LoanAgreementMock {
  state!: {
    nextLoanId: number;
    maxLoans: number;
    minDuration: number;
    maxDuration: number;
    minFee: number;
    maxFee: number;
    minInsurance: number;
    maxInsurance: number;
    penaltyRate: number;
    loans: Map<number, Loan>;
    loanUpdates: Map<number, LoanUpdate>;
    loansByArtifact: Map<number, number>;
  };
  blockHeight = 0;
  caller = "ST1LENDER";
  museumRegistry: MuseumRegistryMock;
  artifactNft: ArtifactNftMock;
  escrowManager: EscrowManagerMock;
  disputeResolution: DisputeResolutionMock;

  constructor() {
    this.museumRegistry = new MuseumRegistryMock();
    this.artifactNft = new ArtifactNftMock();
    this.escrowManager = new EscrowManagerMock();
    this.disputeResolution = new DisputeResolutionMock();
    this.reset();
  }

  reset() {
    this.state = {
      nextLoanId: 0,
      maxLoans: 10000,
      minDuration: 1,
      maxDuration: 365,
      minFee: 0,
      maxFee: 1000000,
      minInsurance: 1000,
      maxInsurance: 10000000,
      penaltyRate: 10,
      loans: new Map(),
      loanUpdates: new Map(),
      loansByArtifact: new Map(),
    };
    this.blockHeight = 0;
    this.caller = "ST1LENDER";
  }

  createLoan(
    artifactId: number,
    borrower: string,
    duration: number,
    fee: number,
    insurance: number,
    condition: string,
    returnAddress: string,
    escrowAmount: number,
    transportMethod: string,
    valuation: number,
    currency: string,
    loanType: string,
    extensionRequested: boolean,
    extensionDuration: number,
    disputeReason: string
  ): { ok: boolean; value: number | typeof ERR_LOAN_NOT_FOUND } {
    const nextId = this.state.nextLoanId;
    if (nextId >= this.state.maxLoans) return { ok: false, value: ERR_MAX_LOANS_EXCEEDED };
    if (artifactId <= 0) return { ok: false, value: ERR_INVALID_ARTIFACT_ID };
    if (duration < this.state.minDuration || duration > this.state.maxDuration) return { ok: false, value: ERR_INVALID_DURATION };
    if (fee < this.state.minFee || fee > this.state.maxFee) return { ok: false, value: ERR_INVALID_FEE };
    if (insurance < this.state.minInsurance || insurance > this.state.maxInsurance) return { ok: false, value: ERR_INVALID_INSURANCE };
    if (condition.length === 0) return { ok: false, value: ERR_INVALID_CONDITION };
    if (returnAddress.length === 0) return { ok: false, value: ERR_INVALID_RETURN_ADDRESS };
    if (escrowAmount <= 0) return { ok: false, value: ERR_INVALID_ESCROW_AMOUNT };
    if (!["air", "sea", "land"].includes(transportMethod)) return { ok: false, value: ERR_INVALID_TRANSPORT_METHOD };
    if (valuation <= 0) return { ok: false, value: ERR_INVALID_VALUATION };
    if (!["STX", "USD", "EUR"].includes(currency)) return { ok: false, value: ERR_INVALID_CURRENCY };
    if (!["temporary", "permanent", "exchange"].includes(loanType)) return { ok: false, value: ERR_INVALID_LOAN_TYPE };
    if (extensionRequested && extensionDuration <= 0) return { ok: false, value: ERR_INVALID_EXTENSION_REQUEST };
    if (disputeReason.length === 0 && disputeReason !== "") return { ok: false, value: ERR_INVALID_DISPUTE_REASON };

    if (!this.museumRegistry.getMuseumDetails(this.caller).ok) return { ok: false, value: ERR_MUSEUM_NOT_VERIFIED };
    if (!this.museumRegistry.getMuseumDetails(borrower).ok) return { ok: false, value: ERR_MUSEUM_NOT_VERIFIED };
    if (this.artifactNft.getOwner(artifactId).value !== this.caller) return { ok: false, value: ERR_ARTIFACT_NOT_OWNED };
    if (!this.escrowManager.depositEscrow(nextId, escrowAmount).ok) return { ok: false, value: ERR_ESCROW_NOT_SET };
    if (this.state.loansByArtifact.has(artifactId)) return { ok: false, value: ERR_LOAN_ALREADY_EXISTS };

    const startTime = this.blockHeight;
    const endTime = startTime + duration;
    const newLoan: Loan = {
      lender: this.caller,
      borrower,
      artifactId,
      duration,
      fee,
      insurance,
      startTime,
      endTime,
      condition,
      returnAddress,
      escrowAmount,
      status: "pending",
      transportMethod,
      valuation,
      currency,
      loanType,
      extensionRequested,
      extensionDuration,
      disputeReason,
    };
    this.state.loans.set(nextId, newLoan);
    this.state.loansByArtifact.set(artifactId, nextId);
    this.state.nextLoanId++;
    return { ok: true, value: nextId };
  }

  acceptLoan(loanId: number): { ok: boolean; value: boolean | typeof ERR_LOAN_NOT_FOUND } {
    const loan = this.state.loans.get(loanId);
    if (!loan) return { ok: false, value: ERR_LOAN_NOT_FOUND };
    if (loan.borrower !== this.caller) return { ok: false, value: ERR_NOT_AUTHORIZED };
    if (loan.status !== "pending") return { ok: false, value: ERR_LOAN_ALREADY_ACCEPTED };
    loan.status = "active";
    this.state.loans.set(loanId, loan);
    this.artifactNft.transfer(loan.artifactId, loan.lender, loan.borrower);
    return { ok: true, value: true };
  }

  endLoan(loanId: number): { ok: boolean; value: boolean | typeof ERR_LOAN_NOT_FOUND } {
    const loan = this.state.loans.get(loanId);
    if (!loan) return { ok: false, value: ERR_LOAN_NOT_FOUND };
    if (this.caller !== loan.lender && this.caller !== loan.borrower) return { ok: false, value: ERR_NOT_AUTHORIZED };
    if (loan.status !== "active") return { ok: false, value: ERR_LOAN_NOT_ACTIVE };
    if (this.blockHeight > loan.endTime) {
      const penalty = loan.escrowAmount * this.state.penaltyRate;
      this.escrowManager.claimPenalty(loanId, penalty, loan.lender);
    } else {
      this.escrowManager.releaseEscrow(loanId, loan.borrower);
    }
    loan.status = "completed";
    loan.endTime = this.blockHeight;
    this.state.loans.set(loanId, loan);
    this.state.loansByArtifact.delete(loan.artifactId);
    this.artifactNft.transfer(loan.artifactId, loan.borrower, loan.lender);
    return { ok: true, value: true };
  }

  requestExtension(loanId: number, newDuration: number): { ok: boolean; value: boolean | typeof ERR_LOAN_NOT_FOUND } {
    const loan = this.state.loans.get(loanId);
    if (!loan) return { ok: false, value: ERR_LOAN_NOT_FOUND };
    if (this.caller !== loan.borrower) return { ok: false, value: ERR_NOT_AUTHORIZED };
    if (loan.status !== "active") return { ok: false, value: ERR_LOAN_NOT_ACTIVE };
    if (newDuration < this.state.minDuration || newDuration > this.state.maxDuration) return { ok: false, value: ERR_INVALID_DURATION };
    loan.extensionRequested = true;
    loan.extensionDuration = newDuration;
    this.state.loans.set(loanId, loan);
    return { ok: true, value: true };
  }

  approveExtension(loanId: number): { ok: boolean; value: boolean | typeof ERR_LOAN_NOT_FOUND } {
    const loan = this.state.loans.get(loanId);
    if (!loan) return { ok: false, value: ERR_LOAN_NOT_FOUND };
    if (this.caller !== loan.lender) return { ok: false, value: ERR_NOT_AUTHORIZED };
    if (!loan.extensionRequested) return { ok: false, value: ERR_EXTENSION_NOT_APPROVED };
    loan.endTime += loan.extensionDuration;
    loan.extensionRequested = false;
    loan.extensionDuration = 0;
    this.state.loans.set(loanId, loan);
    return { ok: true, value: true };
  }

  initiateDispute(loanId: number, reason: string): { ok: boolean; value: boolean | typeof ERR_LOAN_NOT_FOUND } {
    const loan = this.state.loans.get(loanId);
    if (!loan) return { ok: false, value: ERR_LOAN_NOT_FOUND };
    if (this.caller !== loan.lender && this.caller !== loan.borrower) return { ok: false, value: ERR_NOT_AUTHORIZED };
    if (loan.status !== "active") return { ok: false, value: ERR_LOAN_NOT_ACTIVE };
    if (reason.length === 0) return { ok: false, value: ERR_INVALID_DISPUTE_REASON };
    loan.status = "disputed";
    loan.disputeReason = reason;
    this.state.loans.set(loanId, loan);
    this.disputeResolution.initiateDispute(loanId, reason);
    return { ok: true, value: true };
  }

  updateLoanTerms(loanId: number, newDuration: number, newFee: number, newInsurance: number): { ok: boolean; value: boolean | typeof ERR_LOAN_NOT_FOUND } {
    const loan = this.state.loans.get(loanId);
    if (!loan) return { ok: false, value: ERR_LOAN_NOT_FOUND };
    if (this.caller !== loan.lender) return { ok: false, value: ERR_NOT_AUTHORIZED };
    if (loan.status !== "pending") return { ok: false, value: ERR_LOAN_NOT_ACCEPTED };
    if (newDuration < this.state.minDuration || newDuration > this.state.maxDuration) return { ok: false, value: ERR_INVALID_DURATION };
    if (newFee < this.state.minFee || newFee > this.state.maxFee) return { ok: false, value: ERR_INVALID_FEE };
    if (newInsurance < this.state.minInsurance || newInsurance > this.state.maxInsurance) return { ok: false, value: ERR_INVALID_INSURANCE };
    loan.duration = newDuration;
    loan.fee = newFee;
    loan.insurance = newInsurance;
    this.state.loans.set(loanId, loan);
    this.state.loanUpdates.set(loanId, {
      updateDuration: newDuration,
      updateFee: newFee,
      updateInsurance: newInsurance,
      updateTimestamp: this.blockHeight,
      updater: this.caller,
    });
    return { ok: true, value: true };
  }

  getLoan(loanId: number): { ok: boolean; value: Loan | null } {
    const loan = this.state.loans.get(loanId);
    return { ok: !!loan, value: loan ?? null };
  }
}

describe("LoanAgreement", () => {
  let contract: LoanAgreementMock;

  beforeEach(() => {
    contract = new LoanAgreementMock();
  });

  it("creates a valid loan", () => {
    const result = contract.createLoan(
      1,
      "ST1BORROWER",
      30,
      500,
      10000,
      "Excellent condition",
      "Museum Address",
      2000,
      "air",
      50000,
      "STX",
      "temporary",
      false,
      0,
      ""
    );
    expect(result.ok).toBe(true);
    const loan = contract.getLoan(0).value;
    expect(loan?.artifactId).toBe(1);
    expect(loan?.status).toBe("pending");
  });

  it("rejects invalid duration", () => {
    const result = contract.createLoan(
      1,
      "ST1BORROWER",
      0,
      500,
      10000,
      "Excellent condition",
      "Museum Address",
      2000,
      "air",
      50000,
      "STX",
      "temporary",
      false,
      0,
      ""
    );
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_INVALID_DURATION);
  });

  it("accepts a loan", () => {
    contract.createLoan(
      1,
      "ST1BORROWER",
      30,
      500,
      10000,
      "Excellent condition",
      "Museum Address",
      2000,
      "air",
      50000,
      "STX",
      "temporary",
      false,
      0,
      ""
    );
    contract.caller = "ST1BORROWER";
    const result = contract.acceptLoan(0);
    expect(result.ok).toBe(true);
    const loan = contract.getLoan(0).value;
    expect(loan?.status).toBe("active");
  });

  it("ends a loan without penalty", () => {
    contract.createLoan(
      1,
      "ST1BORROWER",
      30,
      500,
      10000,
      "Excellent condition",
      "Museum Address",
      2000,
      "air",
      50000,
      "STX",
      "temporary",
      false,
      0,
      ""
    );
    contract.caller = "ST1BORROWER";
    contract.acceptLoan(0);
    contract.blockHeight = 20;
    contract.caller = "ST1LENDER";
    const result = contract.endLoan(0);
    expect(result.ok).toBe(true);
    const loan = contract.getLoan(0).value;
    expect(loan?.status).toBe("completed");
  });

  it("ends a loan with penalty", () => {
    contract.createLoan(
      1,
      "ST1BORROWER",
      30,
      500,
      10000,
      "Excellent condition",
      "Museum Address",
      2000,
      "air",
      50000,
      "STX",
      "temporary",
      false,
      0,
      ""
    );
    contract.caller = "ST1BORROWER";
    contract.acceptLoan(0);
    contract.blockHeight = 40;
    contract.caller = "ST1LENDER";
    const result = contract.endLoan(0);
    expect(result.ok).toBe(true);
    const loan = contract.getLoan(0).value;
    expect(loan?.status).toBe("completed");
  });

  it("requests and approves extension", () => {
    contract.createLoan(
      1,
      "ST1BORROWER",
      30,
      500,
      10000,
      "Excellent condition",
      "Museum Address",
      2000,
      "air",
      50000,
      "STX",
      "temporary",
      false,
      0,
      ""
    );
    contract.caller = "ST1BORROWER";
    contract.acceptLoan(0);
    const reqResult = contract.requestExtension(0, 15);
    expect(reqResult.ok).toBe(true);
    contract.caller = "ST1LENDER";
    const appResult = contract.approveExtension(0);
    expect(appResult.ok).toBe(true);
    const loan = contract.getLoan(0).value;
    expect(loan?.endTime).toBe(45);
  });

  it("initiates a dispute", () => {
    contract.createLoan(
      1,
      "ST1BORROWER",
      30,
      500,
      10000,
      "Excellent condition",
      "Museum Address",
      2000,
      "air",
      50000,
      "STX",
      "temporary",
      false,
      0,
      ""
    );
    contract.caller = "ST1BORROWER";
    contract.acceptLoan(0);
    const result = contract.initiateDispute(0, "Damaged artifact");
    expect(result.ok).toBe(true);
    const loan = contract.getLoan(0).value;
    expect(loan?.status).toBe("disputed");
  });

  it("updates loan terms", () => {
    contract.createLoan(
      1,
      "ST1BORROWER",
      30,
      500,
      10000,
      "Excellent condition",
      "Museum Address",
      2000,
      "air",
      50000,
      "STX",
      "temporary",
      false,
      0,
      ""
    );
    const result = contract.updateLoanTerms(0, 45, 600, 12000);
    expect(result.ok).toBe(true);
    const loan = contract.getLoan(0).value;
    expect(loan?.duration).toBe(45);
    expect(loan?.fee).toBe(600);
    expect(loan?.insurance).toBe(12000);
  });
});