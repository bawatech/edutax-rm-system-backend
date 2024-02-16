-- 11th February 2024
INSERT INTO `marital_status` (`id`, `code`, `name`) VALUES ('1', 'MRD', 'Married'), ('2', 'UNM', 'Un-Married'),('3', 'CLW', 'Common-Law');

INSERT INTO `taxfile_status` (`id`, `code`, `name`) VALUES ('1', 'NEW_REQUEST', 'New Request'), ('2', 'NEEDS_RESUBMISSION', 'Needs Re-Submission'), ('3', 'RESUBMITTED', 'Re-Submitted'), ('4', 'IN_PROGRESS', 'In Progress'), ('5', 'SIGNING_PENDING', 'Signing Pending'), ('6', 'SIGNED', 'Signed'), ('7', 'PAYMENT_ASKED', 'Payment Asked'), ('8', 'PAYMENT_DONE', 'Payment Done'), ('9', 'COMPLETED', 'Completed');

-- for the time dummy values for document_types but query can be changed
INSERT INTO `document_types` (`id`, `code`, `name`) VALUES ('1', 'PAN', 'Pan Card'), ('2', 'AADHAR', 'Aadhar Card'), ('3', 'PASSPORT', 'Passport');


--14th February 2024
INSERT INTO `provinces` (`id`, `code`, `name`) VALUES ('1', 'ON', 'Ontario'), ('2', 'QC', 'Quebec');

--16th february 2024
INSERT INTO `executive` (`id`, `email`, `password`, `user_type`, `id_status`, `is_deleted`, `otp`, `verify_status`, `added_on`, `added_by`, `deleted_on`) VALUES (NULL, 'admin@edutax.com', 'dddddd@10', 'ADMIN', 'ACTIVE', '0', '', 'VERIFIED', 'current_timestamp(6).000000', '', NULL);