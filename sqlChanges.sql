-- 11th February 2024
INSERT INTO `taxfile_status` (`id`, `code`, `name`) VALUES ('1', 'NEW_REQUEST', 'New Request'), ('2', 'NEEDS_RESUBMISSION', 'Needs Re-Submission'), ('3', 'RESUBMITTED', 'Re-Submitted'), ('4', 'IN_PROGRESS', 'In Progress'), ('5', 'SIGNING_PENDING', 'Signing Pending'), ('6', 'SIGNED', 'Signed'), ('7', 'PAYMENT_ASKED', 'Payment Asked'), ('8', 'PAYMENT_DONE', 'Payment Done'), ('9', 'COMPLETED', 'Completed');


--16th february 2024
--ADMIN account password is Test@123
INSERT INTO `executive` (`id`,`name`, `email`, `password`, `user_type`, `id_status`, `is_deleted`, `otp`, `verify_status`, `added_on`, `added_by`, `deleted_on`) VALUES (NULL,'admin', 'admin@edutax.com', '$2b$10$hehmyqOXA7beoJpd8pzyWuQR5dxGxyCkYGFFbLiqk57ezXAgR7ekK', 'ADMIN', 'ACTIVE', '0', '', 'VERIFIED', NULL, NULL, NULL);

-- 17th february 2024
--master for provinces
-- INSERT INTO `provinces` (`id`, `code`, `name`) VALUES 
-- ('1', 'AB', 'Alberta'), 
-- ('2', 'BC', 'British Columbia'),
-- ('3', 'MB', 'Manitoba'),
-- ('4', 'NB', 'New Brunswick'),
-- ('5', 'NL', 'Newfoundland and Labrador'),
-- ('6', 'NS', 'Nova Scotia'),
-- ('7', 'NT', 'Northwest Territories'),
-- ('8', 'NU', 'Nunavut'),
-- ('9', 'ON', 'Ontario'),
-- ('10', 'PE', 'Prince Edward Island'),
-- ('11', 'QC', 'Quebec'),
-- ('12', 'SK', 'Saskatchewan'),
-- ('13', 'YT', 'Yukon');
INSERT INTO `provinces` (`code`, `name`) VALUES 
('AB', 'Alberta'), 
('BC', 'British Columbia'),
('MB', 'Manitoba'),
('NB', 'New Brunswick'),
('NL', 'Newfoundland and Labrador'),
('NS', 'Nova Scotia'),
('NT', 'Northwest Territories'),
('NU', 'Nunavut'),
('ON', 'Ontario'),
('PE', 'Prince Edward Island'),
('QC', 'Quebec'),
('SK', 'Saskatchewan'),
('YT', 'Yukon');

--master for marital_status
-- INSERT INTO `marital_status` (`id`, `name`, `code`) VALUES 
-- ('1', 'Married', 'MRD'), 
-- ('2', 'Living common-law', 'CLW'),
-- ('3', 'Widowed', 'WDW'),
-- ('4', 'Divorced', 'DVR'),
-- ('5', 'Separated', 'SPR'),
-- ('6', 'Single', 'SGL');
INSERT INTO `marital_status` (`name`, `code`) VALUES 
('Married', 'MRD'), 
('Living common-law', 'CLW'),
('Widowed', 'WDW'),
('Divorced', 'DVR'),
('Separated', 'SPR'),
('Single', 'SGL');

--master for document_types
INSERT INTO `document_types` (`id`, `name`) VALUES ('1', 'T4'), ('2', 'T2202 Tution Slip'), ('3', 'T4A'), ('4', 'T4E');

--21 st February , 2024
INSERT INTO `templates` (`id`, `code`, `title`, `description`, `is_fixed`, `id_status`, `is_deleted`, `added_on`, `added_by`, `updated_on`, `updated_by`, `deleted_on`, `deleted_by`) VALUES ('1', 'TEMP_ONE', 'Template 1', 'Executive message for template one', '0', 'ACTIVE', '0', NULL, NULL, NULL, NULL, NULL, NULL), ('2', 'TEMP_TWO', 'Template 2', 'Executive message for template two', '0', 'ACTIVE', '0', NULL, NULL, NULL, NULL, NULL, NULL), ('3', 'TEMP_THREE', 'Template 3', 'Executive message for template three', '1', 'ACTIVE', '0', NULL, NULL, NULL, NULL, NULL, NULL);