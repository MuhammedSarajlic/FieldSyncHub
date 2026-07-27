-- Wipes all application data while leaving the schema and EF Core migration
-- history intact (so the app keeps working immediately after - no need to
-- re-run migrations).
--
-- Usage (with the Docker stack running):
--   docker compose exec -T mysql mysql -uroot -proot fieldsync < scripts/reset-db.sql
--
-- Usage (local MySQL, no Docker):
--   mysql -u<user> -p<password> fieldsync < scripts/reset-db.sql

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE ActivityHistorys;
TRUNCATE TABLE CustomFieldValues;
TRUNCATE TABLE CustomFields;
TRUNCATE TABLE CustomerNotes;
TRUNCATE TABLE CustomerPhones;
TRUNCATE TABLE EmployeeInvites;
TRUNCATE TABLE EventEmployees;
TRUNCATE TABLE Events;
TRUNCATE TABLE JobAssignedEmployees;
TRUNCATE TABLE LineItems;
TRUNCATE TABLE Notes;
TRUNCATE TABLE Properties;
TRUNCATE TABLE QuoteAttachments;
TRUNCATE TABLE QuoteCustomerNotes;
TRUNCATE TABLE QuoteInternalNotes;
TRUNCATE TABLE StatusChanges;
TRUNCATE TABLE RecurrenceRules;
TRUNCATE TABLE Leads;
TRUNCATE TABLE Invoices;
TRUNCATE TABLE Jobs;
TRUNCATE TABLE Quotes;
TRUNCATE TABLE ServiceItems;
TRUNCATE TABLE Customers;
TRUNCATE TABLE Employees;
TRUNCATE TABLE Users;
TRUNCATE TABLE Workspaces;

SET FOREIGN_KEY_CHECKS = 1;
