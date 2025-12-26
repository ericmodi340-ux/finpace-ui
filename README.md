<p align="center">
  <img src="https://dev.finpace.app/logo/logo_full_finpace.png" />
</p>

# Finpace Technology

An app for investors and investment advisors.

This is the repository for the new and improved Finpace Technology experience, including moving to Material UI and AWS, transitioning to TypeScript, and deprecating legacy functionality.

This repository automatically deploys directly to AWS staging and production hosting. All Finpace developers should use this repository to develop on the app on their local computers.

## Table of Contents

- [Finpace Technology](#finpace-technology)
  - [Table of Contents](#table-of-contents)
  - [What is Finpace Technology?](#what-is-finpace-technology)
  - [Tech Stack](#tech-stack)
  - [Run Locally](#run-locally)
  - [Demo](#demo)
  - [Running Tests](#running-tests)
    - [E2E Tests](#e2e-tests)
  - [Deployment](#deployment)
  - [License](#license)
  - [Acknowledgements](#acknowledgements)
  - [Support](#support)

## What is Finpace?

Finpace is an app for investment firms, advisors, and their clients to quickly generate and sign contracts and other documents.

With Finpace, firms can register their advisor teams to add clients and generate contracts (including IACs and Suitability Forms), distribute disclosures, ADVs, and other documentation, and integrate with a variety of CRMs, custodians, and other services.

## Tech Stack

**Client:** React, TypeScript, Material UI

**Server:** Node (v14.15.0), TypeScript, AWS

**Tests:** Cypress (E2E)

## Run Locally

Clone the project

```bash
  git clone git@github.com:finpace/bitsy-advisor-v2.git
```

Go to the project directory

```bash
  cd bitsy-advisor-v2
```

Ensure you are using your @finpace.com email address for new commits

```bash
  git config user.email "YOUR_NAME@finpace.com"
```

Install dependencies

```bash
  yarn install
```

Before starting the frontend server, please ask your team colleagues for the `.env` file that contains the environment variables required for a proper functioning.

Start the frontend server

```bash
  yarn start
```

_Local backend configuration instructions coming soon..._

## Demo

Once you are [running the app locally](#run-locally), open [http://localhost:3000](http://localhost:3000) and log in as a firm, advisor, or client to explore their dashboards.

Login emails/passwords are as follows:

- **Firm Admin:** test+firmadmin@bitsyadvisor.com / `Password123!`
- **Advisor:** test+advisor@bitsyadvisor.com / `Password123!`
- **Client:** test+client@bitsyadvisor.com / `Password123!`

## Running Tests

### E2E Tests

To run E2E tests, you'll need to [install Cypress](https://docs.cypress.io/guides/getting-started/installing-cypress) and run the following command

> IMPORTANT! Before running this:
>
> Please opt out of sending exception data to Cypress in case any sensitive data gets transmitted by following the instructions [here](https://docs.cypress.io/guides/getting-started/installing-cypress.html#Opt-out-of-sending-exception-data-to-Cypress)

```bash
  yarn cypress:open
```

In order to be able to run `yarn cypress:open` and `yarn cypress:run`, please create a file `cypress.env.json` and ask your team mates for the credentials.

## Deployment

AWS Amplify is set up to automatically bundle a production-optimized build and deploy the app when pushing to:

- `develop` branch (deploys to dev site:
  [https://dev.finpace.app](https://dev.finpace.app))

- `staging` branch (deploys to staging site:
  [https://staging.finpace.app](https://staging.finpace.app))

- `main` branch (deploys to live site: [https://finpace.app](https://finpace.app))

## License

This project is unlicensed for public use.

## Acknowledgements

- This project was boostrapped with [Vite](https://github.com/facebook/create-react-app)
- This project is based on the [Minimal Material UI Dashboard](https://material-ui.com/store/items/minimal-dashboard/)

## Support

For support or help setting up your local, email [Forrest Tuten](mailto:devs@finpace.com), join our Slack channel, or visit the [support site](https://help.finpace.app/en/).

public.ecr.aws/docker/library/node:18.12.0

## Hacks for PDF Export

-hidefrompdf - End Api key with this to hide the field from pdf export
use 'scrollable' - in custom css class in formio for scrollable content
use 's3upload-' at start of upload field

for IDs
s3upload-ids-driversLicense

## Hacks for Advisor Only Panels

![Advisor Only Hack](docs/advisorOnly.png)
