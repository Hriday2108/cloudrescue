# CloudRescue Backend (Node.js + Express + AWS SDK v3)

This is the backend service for **CloudRescue — Cloud Backup and Disaster Recovery System**. It provides secure, controlled API endpoints to upload backups to private Amazon S3 buckets, list and stream stored backups, verify and execute safe recovery workflows, and dispatch audit alerts via Amazon SNS.

---

## 🛠 Tech Stack

- **Runtime:** Node.js (v18+)
- **Framework:** Express.js 4 (ES Modules)
- **AWS SDK:** `@aws-sdk/client-s3`, `@aws-sdk/lib-storage`, `@aws-sdk/client-sns` (v3)
- **File Upload:** `multer` (in-memory buffer storage, strict 1-file constraint, file type and size validation)
- **Security:** `helmet`, `cors` (explicit origins), `express-rate-limit`
- **Config:** `dotenv` with `.env.example`
- **Testing:** Node.js native test runner (`node --test`)

---

## 📁 Project Structure

```
backend/
├── config/
│   └── index.js             # Environment configuration & diagnostics
├── controllers/
│   ├── backupController.js  # S3 upload, list, metadata, download stream, restore
│   ├── healthController.js  # Safe health & AWS configuration diagnostics
│   └── notificationController.js # Notification audit trail & SNS delivery status
├── middleware/
│   ├── errorHandler.js      # Centralized error mapping (Multer, S3, Validation)
│   ├── upload.js            # Multer memory storage & extension filter
│   └── validate.js          # Identifier format & filename sanitization
├── routes/
│   └── index.js             # Express router mounting all endpoints
├── services/
│   ├── backupRegistry.js    # Server-side ID to object-key registry
│   ├── s3Service.js         # Private S3 uploads, streaming, & object listing
│   └── snsService.js        # AWS SNS publish with safe fallback
├── tests/
│   └── api.test.js          # Automated endpoint & security tests
├── .env.example             # Non-secret environment variable template
├── package.json             # Backend dependencies & npm scripts
├── README.md                # This documentation
└── server.js                # Server entry point & graceful shutdown
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18.x or later installed
- AWS Account with an active S3 bucket (or run in local diagnostic mode without AWS)

### 2. Installation
Open a terminal in the `backend` directory:
```bash
cd backend
npm install
```

### 3. Environment Setup
Create a `.env` file inside `backend/` by copying `.env.example`:
```bash
cp .env.example .env
```
Edit `backend/.env` with your desired configuration:

```env
PORT=5000
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:5173
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-private-s3-bucket-name
SNS_TOPIC_ARN=arn:aws:sns:us-east-1:123456789012:your-topic-name
MAX_FILE_SIZE_BYTES=52428800
ALLOWED_FILE_EXTENSIONS=sql,tar,gz,zip,json,csv,log,bak,dump,txt
```

> **IMPORTANT:** Never commit `.env` or real AWS credentials to version control. The repository `.gitignore` automatically excludes all `.env` files.

---

## 🔐 AWS IAM Permissions Needed

The backend uses the **AWS SDK default credential provider chain**. For local development, configure credentials via AWS CLI (`aws configure`) or environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`). When deploying to EC2, assign an **IAM Role** to the instance.

### Required IAM Policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CloudRescueS3Access",
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:GetBucketLocation"
      ],
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME"
    },
    {
      "Sid": "CloudRescueS3ObjectAccess",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:GetObjectAcl"
      ],
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
    },
    {
      "Sid": "CloudRescueSNSPublish",
      "Effect": "Allow",
      "Action": [
        "sns:Publish"
      ],
      "Resource": "arn:aws:sns:YOUR_REGION:YOUR_ACCOUNT_ID:YOUR_TOPIC_NAME"
    }
  ]
}
```

---

## 🏃 Running Frontend and Backend

Run the backend and frontend in two separate terminal windows:

### Terminal 1: Backend
```bash
cd backend
npm start
# Server starts on http://localhost:5000
```
*(For development with auto-reload: `npm run dev`)*

### Terminal 2: Frontend
```bash
# In project root
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 🧪 Testing the APIs

Run the automated test suite:
```bash
cd backend
npm test
```

### Manual Testing with cURL:

#### 1. Health & Diagnostics Check
```bash
curl -X GET http://localhost:5000/api/health
```
*Expected: 200 OK with S3 and SNS configuration status (no credentials or secrets exposed).*

#### 2. List Backups
```bash
curl -X GET http://localhost:5000/api/backups
```

#### 3. Upload a Backup File
```bash
curl -X POST http://localhost:5000/api/backups \
  -F "file=@sample_backup.sql"
```

#### 4. Get Backup Metadata
```bash
curl -X GET http://localhost:5000/api/backups/YOUR_BACKUP_ID
```

#### 5. Securely Stream / Download a Backup
```bash
curl -X GET http://localhost:5000/api/backups/YOUR_BACKUP_ID/download -O -J
```

#### 6. Execute Recovery Workflow
```bash
curl -X POST http://localhost:5000/api/backups/YOUR_BACKUP_ID/restore \
  -H "Content-Type: application/json" \
  -d '{"confirmed": true, "targetEnvironment": "staging-sandbox"}'
```

#### 7. Audit & Notifications History
```bash
curl -X GET http://localhost:5000/api/notifications
```

---

## 🛡 Security & Safety Design

1. **Private S3 Objects:** All objects are stored in the configured private bucket with AES-256 server-side encryption. No public ACLs or public bucket policies are ever created or used.
2. **Server-Generated Object Keys:** The client never controls the full S3 path. Keys are generated server-side using cryptographic tokens (`backups/bk_<timestamp>_<hex>_<sanitized_name>`), preventing directory traversal (`../../`).
3. **No Credential Exposure:** Neither AWS credentials nor secret keys are returned in API responses or printed in error logs.
4. **Safe Restores:** Restores require explicit `confirmed: true` confirmation and restore to an isolated staging target (`staging-restore-sandbox`) to guarantee user local data is never overwritten.
5. **Decoupled SNS Notifications:** If Amazon SNS is unconfigured or returns an error, the event is saved to the local audit trail without failing the primary S3 backup or restore operation.
