-- 11th February 2024
INSERT INTO `marital_status` (`id`, `code`, `name`) VALUES ('1', 'MRD', 'Married'), ('2', 'UNM', 'Un-Married'),('3', 'CLW', 'Common-Law');

INSERT INTO `taxfile_status` (`id`, `code`, `name`) VALUES ('1', 'NEW_REQUEST', 'New Request'), ('2', 'NEEDS_RESUBMISSION', 'Needs Re-Submission'), ('3', 'RESUBMITTED', 'Re-Submitted'), ('4', 'IN_PROGRESS', 'In Progress'), ('5', 'SIGNING_PENDING', 'Signing Pending'), ('6', 'SIGNED', 'Signed'), ('7', 'PAYMENT_ASKED', 'Payment Asked'), ('8', 'PAYMENT_DONE', 'Payment Done'), ('9', 'COMPLETED', 'Completed');

-- for the time dummy values for document_types but query can be changed
INSERT INTO `document_types` (`id`, `code`, `name`) VALUES ('1', 'PAN', 'Pan Card'), ('2', 'AADHAR', 'Aadhar Card'), ('3', 'PASSPORT', 'Passport');


--14th February 2024
INSERT INTO `provinces` (`id`, `code`, `name`) VALUES ('1', 'ON', 'Ontario'), ('2', 'QC', 'Quebec');

--16th february 2024
INSERT INTO `executive` (`id`, `email`, `password`, `user_type`, `id_status`, `is_deleted`, `otp`, `verify_status`, `added_on`, `added_by`, `deleted_on`) VALUES (NULL, 'admin@edutax.com', 'Test@123', 'ADMIN', 'ACTIVE', '0', '', 'VERIFIED', 'current_timestamp(6).000000', '', NULL);

-- 17th february 2024
--master for provinces
INSERT INTO `provinces` (`id`, `code`, `name`) VALUES 
('1', 'AB', 'Alberta'), 
('2', 'BC', 'British Columbia'),
('3', 'MB', 'Manitoba'),
('4', 'NB', 'New Brunswick'),
('5', 'NL', 'Newfoundland and Labrador'),
('6', 'NS', 'Nova Scotia'),
('7', 'NT', 'Northwest Territories'),
('8', 'NU', 'Nunavut'),
('9', 'ON', 'Ontario'),
('10', 'PE', 'Prince Edward Island'),
('11', 'QC', 'Quebec'),
('12', 'SK', 'Saskatchewan'),
('13', 'YT', 'Yukon');

--master for marital_status
INSERT INTO `marital_status` (`id`, `name`, `code`) VALUES 
('1', 'Married', 'MRD'), 
('2', 'Living common-law', 'CLW'),
('3', 'Widowed', 'WDW'),
('4', 'Divorced', 'DVR'),
('5', 'Separated', 'SPR'),
('6', 'Single', 'SGL');

--master for document_types
INSERT INTO `document_types` (`id`, `name`) VALUES ('1', 'T4'), ('2', 'T2202 Tution Slip'), ('3', 'T4A'), ('4', 'T4E');
