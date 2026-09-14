const e=`---\r
title: Design an Authentication Service\r
description: Design a pluggable authentication service with password hashing, revocable sessions, optional MFA and brute force lockout\r
difficulty: Advanced\r
tags: [authentication, security, strategy-pattern, sessions]\r
---\r
\r
An authentication service question is really a security-decisions question wearing an OOP costume: the class diagram is almost incidental, and what interviewers actually listen for is whether you store passwords safely, make sessions genuinely revocable, and treat "MFA required" as a normal outcome rather than an exception.\r
\r
## Requirements\r
\r
### Functional\r
\r
- \`Register(email, password)\` rejects duplicate emails and weak passwords; passwords are stored as salt plus a slow hash, never reversible plaintext.\r
- \`Login(providerName, credentials)\` returns a session token with an expiry; login methods are pluggable — password today, OAuth providers later, with no change to the flow.\r
- If MFA is enabled for the user, login returns a pending challenge instead of a token; a valid TOTP code completes it.\r
- \`Validate(token)\` returns the user, or fails if the token is expired or revoked.\r
- \`Logout(token)\` revokes one session; \`LogoutAll(userId)\` revokes every session for that user.\r
- The account locks for N minutes after K consecutive failed logins.\r
- Password reset uses a single-use, time-bound token.\r
- \`Authorize(token, role)\` performs a basic role check.\r
\r
### Non-functional and assumptions\r
\r
- Opaque, server-side session tokens rather than JWTs — simpler to revoke instantly, at the cost of a store lookup per request.\r
- Real OAuth handshakes with providers, a distributed session store, device fingerprinting/risk scoring, and email/SMS delivery mechanics are all out of scope.\r
- Single process, in-memory storage for the interview; nothing should prevent swapping the session store for Redis later without touching the flow.\r
- Multiple concurrent sessions per user are allowed and must be individually revocable.\r
\r
### Clarifying questions to ask\r
\r
> [!TIP]\r
> Ask "session tokens or JWTs?" before designing anything else — it decides whether \`Validate\` is a store lookup (revocable instantly) or a signature check (stateless, but revocation needs a second mechanism). Stating the trade-off out loud, even if the interviewer picks for you, signals you understand the cost either way.\r
\r
- Which login methods are in scope now, and is the design expected to add more without touching the core flow?\r
- Is MFA mandatory, optional per user, or not in scope at all?\r
- What should happen after repeated failed logins — a lockout, a CAPTCHA, or both?\r
- Is password reset in scope, and does it need to invalidate existing sessions on success?\r
- Can a user hold multiple active sessions across devices, and must each be independently revocable?\r
\r
## Core objects\r
\r
| Class | Responsibility | Key fields/methods |\r
|---|---|---|\r
| \`AuthService\` | Orchestrator — register, login, validate, logout | \`Register\`, \`Login\`, \`VerifyMfa\`, \`Validate\`, \`Authorize\` |\r
| \`User\` | Identity, credential, roles, MFA state | \`Credential\`, \`Roles\`, \`MfaEnabled\`, \`Status\` |\r
| \`Credential\` | Salt, hash and the algorithm used to produce it | \`Salt\`, \`Hash\`, \`Algorithm\` |\r
| \`IPasswordHasher\` | Strategy — the hashing algorithm | \`Hash(password)\`, \`Verify(password, credential)\` |\r
| \`IAuthProvider\` | Strategy — a login method | \`Name\`, \`Authenticate(credentials) -> User\` |\r
| \`ISessionStore\` | Repository — token lifecycle | \`Create\`, \`Get\`, \`Revoke\`, \`RevokeAllForUser\` |\r
| \`LoginAttemptTracker\` | Brute-force lockout bookkeeping | \`IsLocked(email)\`, \`RecordFailure(email)\` |\r
| \`AuthResult\` | Result object for login outcomes | \`Status\` (Success/MfaRequired/Failure), \`Token\`, \`Reason\` |\r
\r
## Class design\r
\r
\`\`\`mermaid\r
classDiagram\r
    class AuthService {\r
        -Dictionary~string, User~ usersByEmail\r
        -Dictionary~string, IAuthProvider~ providers\r
        -IPasswordHasher hasher\r
        -ISessionStore sessions\r
        -LoginAttemptTracker attempts\r
        +Register(email, password) User\r
        +Login(providerName, credentials) AuthResult\r
        +VerifyMfa(challengeId, code) AuthResult\r
        +Validate(token) User\r
        +Authorize(token, role) bool\r
        +Logout(token) void\r
    }\r
    class User {\r
        -string Id\r
        -string Email\r
        -Credential Credential\r
        -HashSet~string~ Roles\r
        -bool MfaEnabled\r
        -UserStatus Status\r
    }\r
    class Credential {\r
        -string Salt\r
        -string Hash\r
        -string Algorithm\r
    }\r
    class IPasswordHasher {\r
        <<interface>>\r
        +Hash(string pwd) Credential\r
        +Verify(string pwd, Credential c) bool\r
    }\r
    class Pbkdf2Hasher\r
    class IAuthProvider {\r
        <<interface>>\r
        +Name string\r
        +Authenticate(credentials) User\r
    }\r
    class PasswordAuthProvider\r
    class OAuthProvider\r
    class Session {\r
        -string Token\r
        -string UserId\r
        -long ExpiresAt\r
        -bool Revoked\r
        +IsValid() bool\r
    }\r
    class ISessionStore {\r
        <<interface>>\r
        +Create(userId, ttlMs) Session\r
        +Get(token) Session\r
        +Revoke(token) void\r
        +RevokeAllForUser(userId) void\r
    }\r
    class LoginAttemptTracker {\r
        +IsLocked(email) bool\r
        +RecordFailure(email) void\r
        +Reset(email) void\r
    }\r
    class AuthResult {\r
        -AuthStatus Status\r
        -string Token\r
        -string Reason\r
    }\r
    IPasswordHasher <|.. Pbkdf2Hasher\r
    IAuthProvider <|.. PasswordAuthProvider\r
    IAuthProvider <|.. OAuthProvider\r
    ISessionStore <|.. InMemorySessionStore\r
    AuthService --> IPasswordHasher\r
    AuthService --> IAuthProvider\r
    AuthService --> ISessionStore\r
    AuthService --> LoginAttemptTracker\r
    AuthService "1" --> "*" User\r
    User --> Credential\r
    ISessionStore "1" --> "*" Session\r
\`\`\`\r
\r
## Key design decisions\r
\r
### 1. Login methods behind a Strategy, not a branch on provider name\r
\r
\`IAuthProvider\` abstracts "how do I turn these credentials into a \`User\`?"; \`AuthService.Login\` just looks up \`_providers[providerName]\` and calls it. Pattern: **Strategy**.\r
\r
> [!KEY]\r
> Rejected alternative: an \`if/else\` chain in \`Login\` — \`if (providerName == "password") {...} else if (providerName == "google") {...}\`. Adding SAML or a second OAuth provider would mean editing and redeploying the core login method every time.\r
\r
### 2. Hash algorithm behind a Strategy, with the algorithm name stored per credential\r
\r
\`IPasswordHasher.Hash\`/\`Verify\` isolate the KDF from everything else, and \`Credential.Algorithm\` records which one produced a given hash. This is what makes migrating to a stronger algorithm possible without a mass password reset: re-hash transparently on next successful login. Rejected alternative: calling a specific hash function directly wherever passwords are checked — indistinguishable hashes with no record of which algorithm made them, so migrating means either breaking every existing credential or maintaining brittle parallel code paths forever.\r
\r
### 3. Session lifecycle behind a Repository interface\r
\r
\`ISessionStore\` hides "where sessions live" behind \`Create\`/\`Get\`/\`Revoke\`/\`RevokeAllForUser\`. Swapping the in-memory implementation for a Redis-backed one (TTL on the key, natural expiry) is a constructor change, not a rewrite. Rejected alternative: session state as fields directly inside \`AuthService\` — couples the orchestrator's business logic to a specific storage choice, and makes horizontal scaling (multiple auth servers) impossible without a rewrite.\r
\r
### 4. Login outcome is a Result object, not an exception\r
\r
\`AuthResult\` carries \`Success\`, \`MfaRequired\`, or \`Failure\` explicitly. Rejected alternative: throwing an exception the moment MFA is required — \`MFA_REQUIRED\` is an expected, common outcome of a correct password, not an error. Modeling it as an exception conflates "something went wrong" with "here's the next step," and makes the two-step login flow (password, then TOTP) awkward for callers to express.\r
\r
## Implementation\r
\r
\`\`\`csharp\r
public interface IPasswordHasher\r
{\r
    Credential Hash(string password);\r
    bool Verify(string password, Credential credential);\r
}\r
\r
public class Pbkdf2Hasher : IPasswordHasher\r
{\r
    private const int Iterations = 100_000;\r
\r
    public Credential Hash(string password)\r
    {\r
        var salt = RandomNumberGenerator.GetBytes(16);\r
        var hash = Derive(password, salt);\r
        return new Credential(Convert.ToBase64String(salt), Convert.ToBase64String(hash), $"PBKDF2-{Iterations}");\r
    }\r
\r
    public bool Verify(string password, Credential credential)\r
    {\r
        var salt = Convert.FromBase64String(credential.Salt);\r
        var actual = Derive(password, salt);\r
        // Fixed-time comparison - a plain == leaks timing information about the hash.\r
        return CryptographicOperations.FixedTimeEquals(actual, Convert.FromBase64String(credential.Hash));\r
    }\r
\r
    private static byte[] Derive(string password, byte[] salt)\r
        => Rfc2898DeriveBytes.Pbkdf2(password, salt, Iterations, HashAlgorithmName.SHA256, 32);\r
}\r
\`\`\`\r
\r
\`\`\`csharp\r
public class PasswordAuthProvider : IAuthProvider\r
{\r
    private static readonly Credential Dummy = new("ZHVtbXk=", "ZHVtbXk=", "PBKDF2-100000");\r
    private readonly Dictionary<string, User> _users;\r
    private readonly IPasswordHasher _hasher;\r
    public string Name => "password";\r
\r
    public User Authenticate(Dictionary<string, string> credentials)\r
    {\r
        var email = credentials["email"];\r
        if (!_users.TryGetValue(email, out var user))\r
        {\r
            _hasher.Verify(credentials["password"], Dummy);   // burn equal time, no enumeration\r
            return null;\r
        }\r
        return _hasher.Verify(credentials["password"], user.Credential) ? user : null;\r
    }\r
}\r
\`\`\`\r
\r
\`\`\`csharp\r
public class AuthService\r
{\r
    public AuthResult Login(string providerName, Dictionary<string, string> credentials)\r
    {\r
        var email = credentials["email"];\r
        if (_attempts.IsLocked(email)) return AuthResult.Failure("Account temporarily locked");\r
\r
        var user = _providers[providerName].Authenticate(credentials);\r
        if (user == null) { _attempts.RecordFailure(email); return AuthResult.Failure("Invalid credentials"); }\r
\r
        _attempts.Reset(email);\r
        if (user.MfaEnabled) return AuthResult.MfaRequired(CreateChallenge(user.Id));\r
\r
        return AuthResult.Success(_sessions.Create(user.Id, SessionTtlMs).Token);\r
    }\r
}\r
\`\`\`\r
\r
## Concurrency and thread safety\r
\r
Three pieces of shared state need distinct protection strategies, not one blanket lock:\r
\r
- **Sessions.** \`ISessionStore\` is backed by a \`ConcurrentDictionary<token, Session>\` — \`Create\`/\`Revoke\` are single-key operations that don't need coordination across tokens.\r
- **Login attempt counters.** \`LoginAttemptTracker\` mutates a per-email counter; two concurrent failed logins for the *same* email must not lose an increment. A \`ConcurrentDictionary<email, State>\` with the increment done under a short per-email lock (or \`Interlocked\` on the counter, computed lockout timestamp written last) keeps this correct without a global lock across all emails.\r
- **MFA challenges.** A challenge must be consumable exactly once — two concurrent \`VerifyMfa\` calls with the same \`challengeId\` (a replayed request, or an attacker guessing) must not both succeed. \`_challenges.Remove(challengeId)\` needs to be paired with the validity check as a single atomic claim (e.g. \`ConcurrentDictionary.TryRemove\` first, validate second), the same "claim, then inspect the claimed copy" pattern used for one-time tokens elsewhere.\r
\r
> [!DANGER]\r
> Checking \`IsLocked\` and then, in a separate step, recording a failure is not atomic across two concurrent requests for the same account — both can read "not locked yet," both proceed, and the account ends up under-protected for one extra guess. This is a minor risk compared to the two callouts below, but worth naming if asked to harden it further.\r
\r
> [!WARNING]\r
> The unknown-email path in \`PasswordAuthProvider.Authenticate\` still calls \`_hasher.Verify\` against a dummy credential before returning \`null\`. Skipping that call for unknown emails is a common shortcut that makes the response time measurably faster for "email not found," which is exactly the timing side-channel that lets an attacker enumerate valid accounts.\r
\r
## Extending the design\r
\r
| New requirement | Where it plugs in | Why the design allows it |\r
|---|---|---|\r
| Add Google/GitHub login | New \`IAuthProvider\` implementing OAuth code exchange, then user lookup/creation by verified email | \`Login\` only knows the \`IAuthProvider\` interface, never a specific provider |\r
| Migrate to a stronger hash algorithm | On successful login, if \`Credential.Algorithm\` is outdated, re-hash the plaintext (available only at that moment) and save | Algorithm is already recorded per credential, not assumed globally |\r
| Scale sessions across multiple servers | Swap \`InMemorySessionStore\` for a Redis-backed \`ISessionStore\`, TTL on the key | Callers only depend on the interface, not the storage mechanism |\r
| Stop distributed brute force across many accounts/IPs | A second limiter keyed by IP/subnet, plus a CAPTCHA past a global threshold | Per-account lockout already exists as an isolated component to sit alongside |\r
| Short-lived access token + long-lived refresh token | \`ISessionStore\` grows a second TTL tier; \`Validate\` checks the short-lived token first | Session creation is already centralized in one method, easy to extend with a second token type |\r
\r
## Cheat sheet\r
\r
- Slow KDF (PBKDF2/bcrypt/argon2) with a unique random salt per user — never a fast hash like SHA-256 alone.\r
- \`FixedTimeEquals\` for hash comparison, and a dummy verify for unknown emails — both close timing side channels.\r
- Generic "Invalid credentials" message regardless of which part was wrong — don't help an attacker enumerate accounts.\r
- Sessions are opaque and server-side specifically because they're instantly revocable, unlike a stateless JWT.\r
- Revoke every session on password change — an attacker with an old session shouldn't survive a reset.\r
- \`MFA_REQUIRED\` is a normal \`AuthResult\` outcome, not an exception — model login as a small state machine, not a single pass/fail call.\r
- Lockout uses a time window, not a permanent ban — it blunts credential stuffing without a permanent DoS on the real user.\r
\r
## Common mistakes\r
\r
| Mistake | Fix |\r
|---|---|\r
| Fast hash (MD5/SHA-256 alone) for passwords | Slow KDF — PBKDF2, bcrypt, or argon2, with real iteration counts |\r
| Reusing one salt, or no salt at all | A unique random salt generated per user, per hash |\r
| Plain \`==\` to compare password hashes | \`CryptographicOperations.FixedTimeEquals\` |\r
| Returning "no such user" vs "wrong password" as different messages | One generic "Invalid credentials" message for both |\r
| Skipping hash verification for unknown emails | Verify against a dummy credential to equalize response time |\r
| Leaving other sessions alive after a password reset | \`RevokeAllForUser\` on every successful password change |\r
| \`Guid\`/\`Random\` for session tokens | Cryptographically secure random bytes (\`RandomNumberGenerator\`) |\r
\r
## Summary\r
\r
An authentication service is judged less on its class diagram than on a checklist of security decisions stated out loud: a slow, salted hash with fixed-time comparison; generic error messages and a dummy-verify path that together prevent account enumeration; opaque, instantly-revocable sessions; and a lockout with a time window rather than a permanent ban. Strategy interfaces for the hash algorithm, the login provider, and the session store are what let all of that harden or scale later — new providers, algorithm migrations, and a distributed session store — without ever touching the core \`Login\`/\`Validate\` flow.\r
\r
## Top Interview Questions\r
\r
### Q1. Why use a slow KDF like PBKDF2 or bcrypt instead of a fast hash like SHA-256 for storing passwords?\r
\r
A fast hash function is designed to be computed as quickly as possible, which is exactly the wrong property for password storage: if a database of hashes leaks, an attacker with GPUs can try billions of SHA-256 guesses per second against it. A slow KDF (PBKDF2 with 100k+ iterations, bcrypt, or argon2) is deliberately expensive to compute — tunable to take, say, 100ms per attempt — which turns an offline brute-force attack from "hours" into "years," even against a leaked database, without meaningfully slowing down the one legitimate login attempt per user.\r
\r
### Q2. Why store a unique random salt per user rather than one global salt for the whole system?\r
\r
A shared salt (or no salt) means two users with the same password get the same hash, immediately visible to anyone who has the database, and a single precomputed rainbow table can attack every account at once. A unique salt per user forces an attacker to brute-force each hash independently — there's no shared precomputation to amortize across accounts — and it also means cross-referencing a leaked hash against a different service's leaked hash of the same password fails, since salts differ.\r
\r
### Q3. Why return the same generic "Invalid credentials" message whether the email doesn't exist or the password is wrong?\r
\r
Because distinguishing the two ("no such account" vs "wrong password") tells an attacker which emails are registered, turning your login endpoint into an account-enumeration tool they can run against a list of millions of addresses. A single generic message removes that signal entirely — but it isn't sufficient on its own if a bad implementation still takes measurably less time to reject unknown emails, since a timing difference is just as much of a signal as an explicit message. That's why the design also runs a dummy hash verification for unknown emails, to equalize response time.\r
\r
### Q4. Walk through the login flow when a user has MFA enabled.\r
\r
\`Login\` authenticates the primary factor first (password or OAuth) via the resolved \`IAuthProvider\`; if that fails, it records a failure and returns \`AuthResult.Failure\` exactly as it would without MFA. If the primary factor succeeds, \`AuthService\` checks \`user.MfaEnabled\`; if true, it does **not** issue a session yet — it creates a short-lived challenge (a random id mapped to the user id, expiring in a few minutes) and returns \`AuthResult.MfaRequired(challengeId)\`. The caller then submits the TOTP code via \`VerifyMfa(challengeId, code)\`, which validates the code, deletes the challenge (single-use), and only then creates and returns the session token — MFA is a second gate before a session is minted, not an afterthought layered on top of one.\r
\r
### Q5. Why model the outcome of \`Login\` as a Result object (\`AuthResult\`) instead of throwing exceptions?\r
\r
Because "MFA required" and "invalid credentials" are both entirely expected, normal outcomes of calling \`Login\` — they are not exceptional circumstances, they are two of the three things this method is explicitly documented to return. Using exceptions for expected control flow is slower (exception handling has real overhead), awkward for callers who now need try/catch just to branch on a routine outcome, and conflates genuine errors (a database being unreachable) with expected business outcomes. A small result type with an explicit status makes every call site's branching visible and typed.\r
\r
### Q6. How would you design account lockout so it blunts credential stuffing without letting an attacker lock out a legitimate user?\r
\r
Track failures per account with a counter and a lockout timestamp: after K consecutive failures, lock the account for N minutes rather than permanently, and reset the counter on any successful login. This bounds the damage of both attacks (a brute-force attempt gets throttled hard) and a griefing attack (an attacker deliberately failing logins to lock out a real user), since the lock is time-bound and self-healing. For a more advanced system, layer a second dimension — IP or device-based rate limiting — so an attacker spreading guesses across many different accounts from one source is still caught even though no single account crosses its own threshold.\r
\r
### Q7. What is the trade-off between opaque server-side sessions and stateless JWTs, and how would you decide?\r
\r
Opaque sessions require a store lookup on every request but are instantly revocable — logout, password change, or an admin action takes effect immediately. JWTs need no lookup (the signature itself is the proof) and scale trivially across stateless servers, but cannot be revoked before their embedded expiry without adding a second mechanism (a blocklist, which reintroduces the lookup you were trying to avoid). A common middle ground: a short-lived JWT access token (5-15 minutes) for most requests, backed by a longer-lived, revocable refresh token used to mint new access tokens — you get most of the statelessness benefit with a bounded window of "can't immediately revoke."\r
\r
### Q8. How would you migrate existing users to a stronger hashing algorithm without forcing a mass password reset?\r
\r
Because \`Credential.Algorithm\` is recorded alongside every hash, you can check it at the one moment you actually have the plaintext password available — a successful login. If the stored algorithm is outdated, re-hash the just-verified plaintext with the new algorithm and persist the updated \`Credential\` before returning the session. Users migrate transparently over time as they log in normally; anyone who never logs in again simply stays on the old algorithm until/unless a forced reset policy is layered on top, which is a reasonable and explicit trade-off to name.\r
\r
### Q9. Why revoke every active session when a user changes or resets their password?\r
\r
Because a password change is very often a direct response to a compromise — if an attacker already has an active session (say, from having stolen the old password earlier), simply changing the password does nothing to eject them if their existing session token remains valid. Calling \`RevokeAllForUser\` as part of both password change and password reset closes that gap: every session, on every device, is invalidated, and each legitimate device has to log in again with the new password, which is the correct and expected friction for a security-sensitive action.\r
\r
### Q10. How would you scale this design to run across multiple authentication server instances?\r
\r
The \`IPasswordHasher\` and \`IAuthProvider\` interfaces need no change at all — hashing and authenticating credentials are stateless per-request operations. \`ISessionStore\` and \`LoginAttemptTracker\`, however, both hold state that must be shared across instances: swap \`InMemorySessionStore\` for a Redis-backed implementation using the token as the key with a native TTL, and move the lockout counters to Redis as well (an in-memory counter per server would let an attacker spread guesses across servers and never trip any single instance's threshold). Both changes are constructor-level swaps behind existing interfaces, not rewrites of \`AuthService\`.\r
\r
### Q11. What security property does \`CryptographicOperations.FixedTimeEquals\` protect against, and why is a normal \`==\` comparison unsafe here?\r
\r
A normal byte-array or string equality check typically short-circuits on the first differing byte, so the time it takes to return false is proportional to how many leading bytes matched. An attacker who can make many login attempts and measure response time precisely enough could use that timing difference to recover a hash byte by byte, which is a genuine (if narrow) side channel. \`FixedTimeEquals\` always compares the full length regardless of where a mismatch occurs, so the comparison takes constant time regardless of how close the guess was, eliminating that timing signal entirely.\r
\r
### Q12. How would you design the password reset flow securely end to end?\r
\r
Generate a single-use token — 32 random bytes, cryptographically random — store only its hash (not the raw token) alongside the user id and a short expiry (15 minutes is typical), and email the raw token to the user's registered address. \`RequestPasswordReset(email)\` returns the same generic response whether or not the email exists, to avoid account enumeration exactly as login does. On \`ResetPassword(token, newPassword)\`, hash the incoming token, look it up, check expiry, then set a fresh \`Credential\` via \`IPasswordHasher.Hash\` and immediately call \`RevokeAllForUser\` — a working reset flow that doesn't also invalidate old sessions leaves a stolen-then-reset account still accessible via the attacker's existing session.\r
`;export{e as default};
