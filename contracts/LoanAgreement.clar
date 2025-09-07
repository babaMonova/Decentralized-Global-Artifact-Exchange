(define-constant ERR-NOT-AUTHORIZED u100)
(define-constant ERR-INVALID-ARTIFACT-ID u101)
(define-constant ERR-INVALID-BORROWER u102)
(define-constant ERR-INVALID-DURATION u103)
(define-constant ERR-INVALID-FEE u104)
(define-constant ERR-INVALID-INSURANCE u105)
(define-constant ERR-INVALID-START-TIME u106)
(define-constant ERR-INVALID-END-TIME u107)
(define-constant ERR-INVALID-CONDITION u108)
(define-constant ERR-INVALID-RETURN-ADDRESS u109)
(define-constant ERR-INVALID-ESCROW-AMOUNT u110)
(define-constant ERR-LOAN-ALREADY-EXISTS u111)
(define-constant ERR-LOAN-NOT-FOUND u112)
(define-constant ERR-LOAN-NOT-ACTIVE u113)
(define-constant ERR-LOAN-EXPIRED u114)
(define-constant ERR-INVALID-STATUS u115)
(define-constant ERR-MUSEUM-NOT-VERIFIED u116)
(define-constant ERR-ARTIFACT-NOT-OWNED u117)
(define-constant ERR-ESCROW-NOT-SET u118)
(define-constant ERR-PENALTY-NOT-APPLICABLE u119)
(define-constant ERR-INVALID-PENALTY-AMOUNT u120)
(define-constant ERR-LOAN-NOT-ACCEPTED u121)
(define-constant ERR-LOAN-ALREADY-ACCEPTED u122)
(define-constant ERR-INVALID-TRANSPORT-METHOD u123)
(define-constant ERR-INVALID-VALUATION u124)
(define-constant ERR-INVALID-CURRENCY u125)
(define-constant ERR-MAX-LOANS-EXCEEDED u126)
(define-constant ERR-INVALID-LOAN-TYPE u127)
(define-constant ERR-INVALID-EXTENSION-REQUEST u128)
(define-constant ERR-EXTENSION-NOT-APPROVED u129)
(define-constant ERR-INVALID-DISPUTE-REASON u130)

(define-data-var next-loan-id uint u0)
(define-data-var max-loans uint u10000)
(define-data-var min-duration uint u1)
(define-data-var max-duration uint u365)
(define-data-var min-fee uint u0)
(define-data-var max-fee uint u1000000)
(define-data-var min-insurance uint u1000)
(define-data-var max-insurance uint u10000000)
(define-data-var penalty-rate uint u10)
(define-data-var authority-contract (optional principal) none)

(define-map loans
  uint
  {
    lender: principal,
    borrower: principal,
    artifact-id: uint,
    duration: uint,
    fee: uint,
    insurance: uint,
    start-time: uint,
    end-time: uint,
    condition: (string-utf8 500),
    return-address: (string-utf8 200),
    escrow-amount: uint,
    status: (string-ascii 20),
    transport-method: (string-utf8 100),
    valuation: uint,
    currency: (string-ascii 3),
    loan-type: (string-utf8 50),
    extension-requested: bool,
    extension-duration: uint,
    dispute-reason: (string-utf8 500)
  }
)

(define-map loan-updates
  uint
  {
    update-duration: uint,
    update-fee: uint,
    update-insurance: uint,
    update-timestamp: uint,
    updater: principal
  }
)

(define-map loans-by-artifact
  uint
  uint
)

(define-read-only (get-loan (id uint))
  (map-get? loans id)
)

(define-read-only (get-loan-updates (id uint))
  (map-get? loan-updates id)
)

(define-read-only (is-loan-active (id uint))
  (let ((loan (map-get? loans id)))
    (match loan l (is-eq (get status l) "active") false)
  )
)

(define-read-only (get-loan-by-artifact (artifact-id uint))
  (map-get? loans-by-artifact artifact-id)
)

(define-private (validate-artifact-id (aid uint))
  (if (> aid u0)
    (ok true)
    (err ERR-INVALID-ARTIFACT-ID))
)

(define-private (validate-borrower (b principal))
  (ok true)
)

(define-private (validate-duration (d uint))
  (if (and (>= d (var-get min-duration)) (<= d (var-get max-duration)))
    (ok true)
    (err ERR-INVALID-DURATION))
)

(define-private (validate-fee (f uint))
  (if (and (>= f (var-get min-fee)) (<= f (var-get max-fee)))
    (ok true)
    (err ERR-INVALID-FEE))
)

(define-private (validate-insurance (i uint))
  (if (and (>= i (var-get min-insurance)) (<= i (var-get max-insurance)))
    (ok true)
    (err ERR-INVALID-INSURANCE))
)

(define-private (validate-start-time (st uint))
  (if (>= st block-height)
    (ok true)
    (err ERR-INVALID-START-TIME))
)

(define-private (validate-end-time (et uint) (st uint) (d uint))
  (if (is-eq et (+ st d))
    (ok true)
    (err ERR-INVALID-END-TIME))
)

(define-private (validate-condition (c (string-utf8 500)))
  (if (> (len c) u0)
    (ok true)
    (err ERR-INVALID-CONDITION))
)

(define-private (validate-return-address (ra (string-utf8 200)))
  (if (> (len ra) u0)
    (ok true)
    (err ERR-INVALID-RETURN-ADDRESS))
)

(define-private (validate-escrow-amount (ea uint))
  (if (> ea u0)
    (ok true)
    (err ERR-INVALID-ESCROW-AMOUNT))
)

(define-private (validate-transport-method (tm (string-utf8 100)))
  (if (or (is-eq tm "air") (is-eq tm "sea") (is-eq tm "land"))
    (ok true)
    (err ERR-INVALID-TRANSPORT-METHOD))
)

(define-private (validate-valuation (v uint))
  (if (> v u0)
    (ok true)
    (err ERR-INVALID-VALUATION))
)

(define-private (validate-currency (cur (string-ascii 3)))
  (if (or (is-eq cur "STX") (is-eq cur "USD") (is-eq cur "EUR"))
    (ok true)
    (err ERR-INVALID-CURRENCY))
)

(define-private (validate-loan-type (lt (string-utf8 50)))
  (if (or (is-eq lt "temporary") (is-eq lt "permanent") (is-eq lt "exchange"))
    (ok true)
    (err ERR-INVALID-LOAN-TYPE))
)

(define-private (validate-extension-request (er bool) (ed uint))
  (if (and er (> ed u0))
    (ok true)
    (err ERR-INVALID-EXTENSION-REQUEST))
)

(define-private (validate-dispute-reason (dr (string-utf8 500)))
  (if (> (len dr) u0)
    (ok true)
    (err ERR-INVALID-DISPUTE-REASON))
)

(define-public (set-authority-contract (contract-principal principal))
  (begin
    (asserts! (is-none (var-get authority-contract)) (err ERR-NOT-AUTHORIZED))
    (var-set authority-contract (some contract-principal))
    (ok true)
  )
)

(define-public (set-max-loans (new-max uint))
  (begin
    (asserts! (is-some (var-get authority-contract)) (err ERR-NOT-AUTHORIZED))
    (var-set max-loans new-max)
    (ok true)
  )
)

(define-public (set-duration-limits (min-d uint) (max-d uint))
  (begin
    (asserts! (is-some (var-get authority-contract)) (err ERR-NOT-AUTHORIZED))
    (var-set min-duration min-d)
    (var-set max-duration max-d)
    (ok true)
  )
)

(define-public (set-fee-limits (min-f uint) (max-f uint))
  (begin
    (asserts! (is-some (var-get authority-contract)) (err ERR-NOT-AUTHORIZED))
    (var-set min-fee min-f)
    (var-set max-fee max-f)
    (ok true)
  )
)

(define-public (set-insurance-limits (min-i uint) (max-i uint))
  (begin
    (asserts! (is-some (var-get authority-contract)) (err ERR-NOT-AUTHORIZED))
    (var-set min-insurance min-i)
    (var-set max-insurance max-i)
    (ok true)
  )
)

(define-public (set-penalty-rate (new-rate uint))
  (begin
    (asserts! (is-some (var-get authority-contract)) (err ERR-NOT-AUTHORIZED))
    (var-set penalty-rate new-rate)
    (ok true)
  )
)

(define-public (create-loan
  (artifact-id uint)
  (borrower principal)
  (duration uint)
  (fee uint)
  (insurance uint)
  (condition (string-utf8 500))
  (return-address (string-utf8 200))
  (escrow-amount uint)
  (transport-method (string-utf8 100))
  (valuation uint)
  (currency (string-ascii 3))
  (loan-type (string-utf8 50))
  (extension-requested bool)
  (extension-duration uint)
  (dispute-reason (string-utf8 500))
  )
  (let (
    (next-id (var-get next-loan-id))
    (current-max (var-get max-loans))
    (lender tx-sender)
    (start-time block-height)
    (end-time (+ start-time duration))
    (museum-check-lender (contract-call? .museum-registry get-museum-details lender))
    (museum-check-borrower (contract-call? .museum-registry get-museum-details borrower))
    (artifact-owner (contract-call? .artifact-nft get-owner artifact-id))
    (escrow-check (contract-call? .escrow-manager deposit-escrow next-id escrow-amount))
  )
    (asserts! (< next-id current-max) (err ERR-MAX-LOANS-EXCEEDED))
    (try! (validate-artifact-id artifact-id))
    (try! (validate-borrower borrower))
    (try! (validate-duration duration))
    (try! (validate-fee fee))
    (try! (validate-insurance insurance))
    (try! (validate-start-time start-time))
    (try! (validate-end-time end-time start-time duration))
    (try! (validate-condition condition))
    (try! (validate-return-address return-address))
    (try! (validate-escrow-amount escrow-amount))
    (try! (validate-transport-method transport-method))
    (try! (validate-valuation valuation))
    (try! (validate-currency currency))
    (try! (validate-loan-type loan-type))
    (try! (validate-extension-request extension-requested extension-duration))
    (try! (validate-dispute-reason dispute-reason))
    (asserts! (is-ok museum-check-lender) (err ERR-MUSEUM-NOT-VERIFIED))
    (asserts! (is-ok museum-check-borrower) (err ERR-MUSEUM-NOT-VERIFIED))
    (asserts! (is-eq artifact-owner (ok lender)) (err ERR-ARTIFACT-NOT-OWNED))
    (asserts! (is-ok escrow-check) (err ERR-ESCROW-NOT-SET))
    (asserts! (is-none (map-get? loans-by-artifact artifact-id)) (err ERR_LOAN-ALREADY-EXISTS))
    (map-set loans next-id
      {
        lender: lender,
        borrower: borrower,
        artifact-id: artifact-id,
        duration: duration,
        fee: fee,
        insurance: insurance,
        start-time: start-time,
        end-time: end-time,
        condition: condition,
        return-address: return-address,
        escrow-amount: escrow-amount,
        status: "pending",
        transport-method: transport-method,
        valuation: valuation,
        currency: currency,
        loan-type: loan-type,
        extension-requested: extension-requested,
        extension-duration: extension-duration,
        dispute-reason: dispute-reason
      }
    )
    (map-set loans-by-artifact artifact-id next-id)
    (var-set next-loan-id (+ next-id u1))
    (print { event: "loan-created", id: next-id })
    (ok next-id)
  )
)

(define-public (accept-loan (loan-id uint))
  (let (
    (loan (unwrap! (map-get? loans loan-id) (err ERR-LOAN-NOT-FOUND)))
    (borrower tx-sender)
  )
    (asserts! (is-eq (get borrower loan) borrower) (err ERR-NOT-AUTHORIZED))
    (asserts! (is-eq (get status loan) "pending") (err ERR-LOAN-ALREADY-ACCEPTED))
    (map-set loans loan-id (merge loan { status: "active" }))
    (contract-call? .artifact-nft transfer artifact-id (get lender loan) borrower)
    (print { event: "loan-accepted", id: loan-id })
    (ok true)
  )
)

(define-public (end-loan (loan-id uint))
  (let (
    (loan (unwrap! (map-get? loans loan-id) (err ERR_LOAN-NOT-FOUND)))
    (current-time block-height)
    (lender (get lender loan))
    (borrower (get borrower loan))
    (escrow-amount (get escrow-amount loan))
  )
    (asserts! (or (is-eq tx-sender lender) (is-eq tx-sender borrower)) (err ERR-NOT-AUTHORIZED))
    (asserts! (is-eq (get status loan) "active") (err ERR-LOAN-NOT-ACTIVE))
    (if (> current-time (get end-time loan))
      (begin
        (let ((penalty (* escrow-amount (var-get penalty-rate))))
          (contract-call? .escrow-manager claim-penalty loan-id penalty lender))
      )
      (contract-call? .escrow-manager release-escrow loan-id borrower)
    )
    (map-set loans loan-id (merge loan { status: "completed", end-time: current-time }))
    (map-delete loans-by-artifact (get artifact-id loan))
    (contract-call? .artifact-nft transfer (get artifact-id loan) borrower lender)
    (print { event: "loan-ended", id: loan-id })
    (ok true)
  )
)

(define-public (request-extension (loan-id uint) (new-duration uint))
  (let (
    (loan (unwrap! (map-get? loans loan-id) (err ERR-LOAN-NOT-FOUND)))
  )
    (asserts! (is-eq tx-sender (get borrower loan)) (err ERR-NOT-AUTHORIZED))
    (asserts! (is-eq (get status loan) "active") (err ERR_LOAN-NOT-ACTIVE))
    (try! (validate-duration new-duration))
    (map-set loans loan-id (merge loan { extension-requested: true, extension-duration: new-duration }))
    (print { event: "extension-requested", id: loan-id })
    (ok true)
  )
)

(define-public (approve-extension (loan-id uint))
  (let (
    (loan (unwrap! (map-get? loans loan-id) (err ERR_LOAN-NOT-FOUND)))
    (new-end-time (+ (get end-time loan) (get extension-duration loan)))
  )
    (asserts! (is-eq tx-sender (get lender loan)) (err ERR-NOT-AUTHORIZED))
    (asserts! (get extension-requested loan) (err ERR_EXTENSION-NOT-APPROVED))
    (map-set loans loan-id (merge loan { end-time: new-end-time, extension-requested: false, extension-duration: u0 }))
    (print { event: "extension-approved", id: loan-id })
    (ok true)
  )
)

(define-public (initiate-dispute (loan-id uint) (reason (string-utf8 500)))
  (let (
    (loan (unwrap! (map-get? loans loan-id) (err ERR_LOAN-NOT-FOUND)))
  )
    (asserts! (or (is-eq tx-sender (get lender loan)) (is-eq tx-sender (get borrower loan))) (err ERR-NOT-AUTHORIZED))
    (asserts! (is-eq (get status loan) "active") (err ERR_LOAN-NOT-ACTIVE))
    (try! (validate-dispute-reason reason))
    (map-set loans loan-id (merge loan { status: "disputed", dispute-reason: reason }))
    (contract-call? .dispute-resolution initiate-dispute loan-id reason)
    (print { event: "dispute-initiated", id: loan-id })
    (ok true)
  )
)

(define-public (update-loan-terms (loan-id uint) (new-duration uint) (new-fee uint) (new-insurance uint))
  (let (
    (loan (unwrap! (map-get? loans loan-id) (err ERR_LOAN-NOT-FOUND)))
  )
    (asserts! (is-eq tx-sender (get lender loan)) (err ERR-NOT-AUTHORIZED))
    (asserts! (is-eq (get status loan) "pending") (err ERR_LOAN-NOT-ACCEPTED))
    (try! (validate-duration new-duration))
    (try! (validate-fee new-fee))
    (try! (validate-insurance new-insurance))
    (map-set loans loan-id (merge loan { duration: new-duration, fee: new-fee, insurance: new-insurance }))
    (map-set loan-updates loan-id
      {
        update-duration: new-duration,
        update-fee: new-fee,
        update-insurance: new-insurance,
        update-timestamp: block-height,
        updater: tx-sender
      }
    )
    (print { event: "loan-updated", id: loan-id })
    (ok true)
  )
)

(define-read-only (calculate-penalty (loan-id uint))
  (let (
    (loan (unwrap! (map-get? loans loan-id) (err ERR_LOAN-NOT-FOUND)))
    (overdue-time (- block-height (get end-time loan)))
  )
    (if (> overdue-time u0)
      (ok (* (get escrow-amount loan) (var-get penalty-rate) overdue-time))
      (err ERR_PENALTY-NOT-APPLICABLE)
    )
  )
)

(define-read-only (get-active-loans-count)
  (fold count-active-loans (map-get? loans) u0)
)

(define-private (count-active-loans (id uint) (count uint))
  (let ((loan (map-get? loans id)))
    (match loan l (if (is-eq (get status l) "active") (+ count u1) count) count)
  )
)