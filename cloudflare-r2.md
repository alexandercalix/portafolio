# Cloudflare R2 Object Storage Setup Guide

This guide outlines the step-by-step process for configuring a Cloudflare R2 bucket to serve as a zero-egress cost storage solution for images and media assets.

## Overview

Cloudflare R2 is an S3-compatible object storage service. By leveraging it, you can store media assets and serve them directly to users via Cloudflare's edge network, completely bypassing your backend API for read operations.

## Step 1: Create the Storage Bucket

1. Log into your Cloudflare dashboard and navigate to **R2** in the left sidebar.
2. Click **Create bucket**.
3. **Name:** Choose a clean, recognizable name (e.g., `portfolio-assets`).
4. **Location:** Set to **Automatic** (or pick a region physically closest to your backend servers).
5. **Storage Class:** Leave as **Standard** (ideal for frequently accessed web images).
6. Click **Create bucket**.

## Step 2: Generate Secure S3 Credentials

Your backend needs programmatic access to upload files to this bucket.

1. Navigate back to the main R2 overview page.
2. Click **Manage R2 API Tokens** on the right side of the screen.
3. Click **Create API token**.
4. **Token Name:** Give it a descriptive name (e.g., `Backend Upload Token`).
5. **Permissions:** Change from "Read" to **Object Read & Write**.
6. **Specify Buckets:** This is a critical security step. Select **Specific buckets** and choose only the bucket you created in Step 1. Never grant global access.
7. Click **Create API Token**.

## Step 3: Save Environment Variables

Upon creation, Cloudflare will display your security credentials. Copy these immediately, as the secret will not be shown again. You will need these for your backend configuration:

- `Access Key ID`
- `Secret Access Key`
- `S3 Endpoint URL` (Specifically the jurisdiction-specific endpoint format).
