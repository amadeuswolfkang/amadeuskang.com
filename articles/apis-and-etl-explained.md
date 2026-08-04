---
title: APIs and ETL explained
date: 2026-08-04
tag: work
description: Brief introduction to APIs and ETL for data engineering on-ramping.
---

# What is an API?

An API (application programming interface) is an interface that enables a client app to request data from a server. A simple example is your social media feed on Instagram. Every time you scroll down, the app calls an API to fetch posts to display on your screen.

# How do APIs work?

APIs return data in JSON chunks called pages. To fetch the next page, the current page either gives you a token, link, or offset. You can loop through pages until there are none left. If fetching pages fail, you can retry, but you must respect rate limits with back-off.


RESTful APIs are the most common API type. You don't need to know the REST theory, you just have to know that REST follows the CRUD principle, providing 4 primary operations: create, read, update, and delete in the HTTP form of POST, GET, PUT, and DELETE. GET and DELETE are self-explanatory. POST is creating a new resource, PUT is updating an existing resource.

Additional API types include websockets (continuous data stream) and webhooks (one-way automated data pushing), but most APIs are RESTful.

# HTTP status codes

API calls respond with a status code. 4xx is a client error, *your fault*. 5xx codes are server errors, *their fault*.
- **400 bad request:** Mistake in the request, usually malformed JSON or parameters.
- **401 unauthorized:** You're missing a valid key or token to access the API.
- **403 forbidden:** Your credentials work, but you're still denied.
- **404 not found:** Usually wrong URL.
- **429 too many requests:** Slow down and respect the rate limit.

# What is ETL?

ETL is a 3-step data handling process: extract, transform, and load. Note that the newer ELT exists. Data used to be transformed before loading due to constrained storage and compute costs. ETL is still used sanitize sensitive data before loading it to a broadly-accessible place.

# Data orchestration

A data orchestrator is basically a task scheduler and workflow manager. Pipelines are modeled as DAG (directed acyclic graphs, a fancy word for a web of one-way lines, ending in one direction). The modern open-source data orchestrator is [Airflow](https://airflow.apache.org/).

A simple pipe line example is (1) extract from an API → (2) load to S3 → (3) transform in the warehouse → (4) refresh the dashboard.

S3 (simple storage service) is Amazon's cloud-based data storage service. A [warehouse](https://en.wikipedia.org/wiki/Data_warehouse) is a central data repository of an enterprise's disparate data sources.

When pipelines fail, each step should already be idempotent, meaning it can rerun safely without duping data.

# Postman

[Postman](https://www.postman.com/) is an API building and testing platform, good for cursory exploration and sanity-checking API calls.
