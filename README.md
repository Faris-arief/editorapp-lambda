# EditorApp Lambda - Serverless Framework Project

A Serverless Framework project for AWS Lambda with EventBridge cron job capabilities.

## Features

- 🕒 **EventBridge Cron Jobs** - Automated tasks with flexible scheduling
- 🚀 **Serverless Framework** - Easy deployment and infrastructure management
- 📊 **Multiple Cron Examples** - Daily, weekly, and hourly job templates
- 🌐 **REST API** - Basic HTTP endpoints for health checks
- 🔧 **Local Development** - Serverless offline support

## Project Structure

```
editorapp-lambda/
├── src/
│   └── handlers/
│       ├── cronJobs.js      # Cron job functions
│       ├── api.js           # API endpoint handlers
│       └── index.js         # Handler exports
├── serverless.yml           # Serverless configuration
├── package.json            # Dependencies and scripts
├── .env.example           # Environment variables template
└── README.md              # This file
```

## Cron Jobs Included

### 1. Daily Data Processor
- **Schedule**: Once daily (rate(1 day))
- **Purpose**: Process and aggregate daily data
- **Handler**: `dailyDataProcessor`

### 2. Weekly Report Generator
- **Schedule**: Every Monday at 9 AM UTC (cron(0 9 ? * MON *))
- **Purpose**: Generate weekly reports
- **Handler**: `weeklyReport`

### 3. Hourly Sync
- **Schedule**: Every hour (rate(1 hour))
- **Purpose**: Sync data between systems
- **Handler**: `hourlySync`

## EventBridge Schedule Formats

### Rate Expressions
```yaml
rate(1 minute)    # Every minute
rate(5 minutes)   # Every 5 minutes
rate(1 hour)      # Every hour
rate(1 day)       # Every day
```

### Cron Expressions
```yaml
cron(0 12 * * ? *)     # Daily at noon UTC
cron(0 9 ? * MON *)    # Every Monday at 9 AM UTC
cron(0 0 1 * ? *)      # First day of every month at midnight
cron(0 0,12 * * ? *)   # Every day at midnight and noon
```

## Getting Started

### Prerequisites
- Node.js 18.x or later
- AWS CLI configured
- Serverless Framework CLI

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Install Serverless Framework globally:**
   ```bash
   npm install -g serverless
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

### Local Development

1. **Start offline server:**
   ```bash
   npm run dev
   ```

2. **Test API endpoints:**
   ```bash
   curl http://localhost:3000/health
   curl http://localhost:3000/status
   ```

### Deployment

1. **Deploy to development:**
   ```bash
   npm run deploy:dev
   ```

2. **Deploy to production:**
   ```bash
   npm run deploy:prod
   ```

3. **Remove deployment:**
   ```bash
   npm run remove
   ```

### Testing Functions

1. **Invoke a function locally:**
   ```bash
   serverless invoke local -f dailyDataProcessor
   ```

2. **Invoke deployed function:**
   ```bash
   serverless invoke -f dailyDataProcessor --stage dev
   ```

3. **View function logs:**
   ```bash
   serverless logs -f dailyDataProcessor --stage dev
   ```

## Configuration

### Adding New Cron Jobs

1. **Add function to `serverless.yml`:**
   ```yaml
   functions:
     myNewCronJob:
       handler: src/handlers/cronJobs.myNewCronJob
       events:
         - eventBridge:
             schedule: rate(30 minutes)
             description: 'Runs every 30 minutes'
             enabled: true
   ```

2. **Implement handler in `src/handlers/cronJobs.js`:**
   ```javascript
   exports.myNewCronJob = async (event, context) => {
     console.log('My new cron job started');
     // Your logic here
   };
   ```

### Environment Variables

Add environment variables in `serverless.yml`:

```yaml
provider:
  environment:
    MY_VAR: ${env:MY_VAR}
    STAGE: ${self:provider.stage}
```

### IAM Permissions

Add necessary permissions in `serverless.yml`:

```yaml
provider:
  iam:
    role:
      statements:
        - Effect: Allow
          Action:
            - dynamodb:Query
            - dynamodb:Scan
          Resource: 'arn:aws:dynamodb:*:*:table/MyTable'
```

## Monitoring

### CloudWatch Logs
- All functions log to CloudWatch automatically
- Access logs via AWS Console or Serverless CLI

### Metrics
- Lambda invocations, duration, and errors tracked automatically
- EventBridge rule executions monitored in CloudWatch

## Troubleshooting

### Common Issues

1. **Deployment failures:**
   - Check AWS credentials: `aws sts get-caller-identity`
   - Verify IAM permissions for Serverless deployment

2. **Cron jobs not triggering:**
   - Check EventBridge rules in AWS Console
   - Verify `enabled: true` in serverless.yml

3. **Function timeouts:**
   - Increase timeout in function configuration
   - Monitor execution time in CloudWatch

### Debug Mode
```bash
SLS_DEBUG=* serverless deploy
```

## Security

- Functions run with minimal IAM permissions
- Environment variables encrypted in transit
- Use AWS Secrets Manager for sensitive data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details