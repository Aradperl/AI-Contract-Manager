# Contract_Folders DynamoDB table

For custom folders to work, create this table in AWS (same region as your other tables).

**Table name:** `Contract_Folders`

**Keys:**
- Partition key: `user_id` (String)
- Sort key: `folder_id` (String)

**Attributes (stored per item):** `name`, `color`, `symbol`, `contract_ids` (List of strings).

Example AWS CLI:
```bash
aws dynamodb create-table \
  --table-name Contract_Folders \
  --attribute-definitions AttributeName=user_id,AttributeType=S AttributeName=folder_id,AttributeType=S \
  --key-schema AttributeName=user_id,KeyType=HASH AttributeName=folder_id,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST
```
