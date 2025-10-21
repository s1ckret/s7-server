# S7

## About

These notes are for me. So dynamodb idea didn't worked out, so I switched to sqllite.

## How-tos

### Migrations

Create using
```bash
npm run knex --  migrate:make create-initial-tables --env production
```

Run using
```bash
npm run knex -- migrate:latest --env production
```