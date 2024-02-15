-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 15, 2024 at 09:12 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `employee_management`
--

-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE `documents` (
  `id` int(11) NOT NULL,
  `taxfile_id_fk` int(11) NOT NULL,
  `user_id_fk` int(11) NOT NULL,
  `type_id_fk` int(11) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `created_on` timestamp(6) NOT NULL DEFAULT current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `documents`
--

INSERT INTO `documents` (`id`, `taxfile_id_fk`, `user_id_fk`, `type_id_fk`, `filename`, `created_on`) VALUES
(1, 1, 4, 2, 'image2.jpg', '2024-02-14 04:34:10.490160'),
(2, 1, 4, 2, 'image1.jpg', '2024-02-14 07:44:58.064686'),
(3, 2, 4, 1, 'image1.jpg', '2024-02-14 12:06:10.374962');

-- --------------------------------------------------------

--
-- Table structure for table `document_types`
--

CREATE TABLE `document_types` (
  `id` int(11) NOT NULL,
  `code` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `document_types`
--

INSERT INTO `document_types` (`id`, `code`, `name`) VALUES
(1, 'PAN', 'Pan Card'),
(2, 'AADHAR', 'Aadhar Card'),
(3, 'PASSPORT', 'Passport');

-- --------------------------------------------------------

--
-- Table structure for table `executive`
--

CREATE TABLE `executive` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `id_status` enum('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `is_deleted` tinyint(4) NOT NULL DEFAULT 0,
  `created_on` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `deleted_on` timestamp(6) NULL DEFAULT NULL ON UPDATE current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `executive_log`
--

CREATE TABLE `executive_log` (
  `id` int(11) NOT NULL,
  `executive_id_fk` int(11) NOT NULL,
  `key` varchar(255) NOT NULL,
  `privs` varchar(10) NOT NULL,
  `id_status` enum('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `is_deleted` tinyint(4) NOT NULL DEFAULT 0,
  `added_on` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `deleted_on` timestamp(6) NULL DEFAULT NULL ON UPDATE current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `marital_status`
--

CREATE TABLE `marital_status` (
  `id` int(11) NOT NULL,
  `code` enum('MRD','UNM','CLW') NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `marital_status`
--

INSERT INTO `marital_status` (`id`, `code`, `name`) VALUES
(1, 'MRD', 'Married'),
(2, 'UNM', 'Un-Married'),
(3, 'CLW', 'Common-Law');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `taxfile_id_fk` int(11) NOT NULL,
  `message` text NOT NULL,
  `category` varchar(255) NOT NULL,
  `user_type` enum('CLIENT','EXECUTIVE') NOT NULL,
  `added_on` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `added_by` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `profile`
--

CREATE TABLE `profile` (
  `id` int(11) NOT NULL,
  `firstname` varchar(255) NOT NULL,
  `lastname` varchar(255) NOT NULL,
  `date_of_birth` date NOT NULL,
  `marital_status` varchar(255) NOT NULL,
  `street_name` varchar(255) NOT NULL,
  `city` varchar(255) NOT NULL,
  `province` varchar(100) NOT NULL,
  `postal_code` varchar(255) NOT NULL,
  `mobile_number` varchar(255) NOT NULL,
  `added_on` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `added_by` int(11) NOT NULL,
  `updated_on` timestamp(6) NULL DEFAULT NULL ON UPDATE current_timestamp(6),
  `updated_by` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `provinces`
--

CREATE TABLE `provinces` (
  `id` int(11) NOT NULL,
  `code` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `provinces`
--

INSERT INTO `provinces` (`id`, `code`, `name`) VALUES
(1, 'ON', 'Ontario'),
(2, 'QC', 'Quebec');

-- --------------------------------------------------------

--
-- Table structure for table `taxfile`
--

CREATE TABLE `taxfile` (
  `id` int(11) NOT NULL,
  `firstname` varchar(255) NOT NULL,
  `lastname` varchar(255) NOT NULL,
  `marital_status` varchar(255) NOT NULL,
  `street_name` varchar(255) NOT NULL,
  `city` varchar(255) NOT NULL,
  `postal_code` varchar(255) NOT NULL,
  `mobile_number` varchar(255) NOT NULL,
  `file_status` varchar(255) NOT NULL DEFAULT 'NEW_REQUEST',
  `file_status_updated_on` timestamp(6) NULL DEFAULT NULL ON UPDATE current_timestamp(6),
  `file_status_updated_by` int(11) NOT NULL,
  `tax_year` varchar(255) NOT NULL,
  `updated_on` timestamp(6) NULL DEFAULT NULL ON UPDATE current_timestamp(6),
  `updated_by` int(11) NOT NULL,
  `taxfile_province` varchar(255) NOT NULL,
  `moved_to_canada` varchar(255) NOT NULL,
  `date_of_entry` varchar(255) NOT NULL,
  `direct_deposit_cra` varchar(255) NOT NULL,
  `document_direct_deposit_cra` varchar(255) NOT NULL,
  `added_on` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `added_by` int(11) NOT NULL,
  `created_on` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `created_by` int(11) NOT NULL,
  `date_of_birth` date NOT NULL,
  `province` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `taxfile_status`
--

CREATE TABLE `taxfile_status` (
  `id` int(11) NOT NULL,
  `code` enum('NEW_REQUEST','NEEDS_RESUBMISSION','RESUBMITTED','IN_PROGRESS','SIGNING_PENDING','SIGNED','PAYMENT_ASKED','PAYMENT_DONE','COMPLETED') NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `taxfile_status`
--

INSERT INTO `taxfile_status` (`id`, `code`, `name`) VALUES
(1, 'NEW_REQUEST', 'New Request'),
(2, 'NEEDS_RESUBMISSION', 'Needs Re-Submission'),
(3, 'RESUBMITTED', 'Re-Submitted'),
(4, 'IN_PROGRESS', 'In Progress'),
(5, 'SIGNING_PENDING', 'Signing Pending'),
(6, 'SIGNED', 'Signed'),
(7, 'PAYMENT_ASKED', 'Payment Asked'),
(8, 'PAYMENT_DONE', 'Payment Done'),
(9, 'COMPLETED', 'Completed');

-- --------------------------------------------------------

--
-- Table structure for table `taxfile_status_log`
--

CREATE TABLE `taxfile_status_log` (
  `id` int(11) NOT NULL,
  `taxfile_id_fk` int(11) NOT NULL,
  `last_file_status` varchar(255) NOT NULL,
  `last_file_status_updated_on` timestamp(6) NULL DEFAULT NULL ON UPDATE current_timestamp(6),
  `last_file_status_updated_by` int(11) NOT NULL,
  `added_on` timestamp(6) NOT NULL DEFAULT current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `age` int(11) NOT NULL,
  `otp` varchar(255) NOT NULL,
  `verify_status` enum('PENDING','VERIFIED') NOT NULL DEFAULT 'PENDING',
  `id_status` enum('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `is_deleted` tinyint(4) NOT NULL DEFAULT 0,
  `created_on` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `deleted_on` timestamp(6) NULL DEFAULT NULL ON UPDATE current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `password`, `email`, `age`, `otp`, `verify_status`, `id_status`, `is_deleted`, `created_on`, `deleted_on`) VALUES
(1, 'sssss', 'deepnirmaan8@gmail.com', 0, '', 'PENDING', 'ACTIVE', 0, '2024-02-14 04:29:53.110000', '2024-02-14 14:01:19.034000'),
(2, 'dddddd@10', 'office6@yopmail.com', 0, '391524', 'PENDING', 'ACTIVE', 0, '2024-02-14 08:15:14.850414', NULL),
(3, 'dddddd@10', 'office7@yopmail.com', 0, '411163', 'PENDING', 'ACTIVE', 0, '2024-02-14 08:17:10.764798', NULL),
(4, 'dddddd@10', 'office8@yopmail.com', 0, '', 'VERIFIED', 'ACTIVE', 0, '2024-02-14 08:19:07.493000', NULL),
(5, 'dddddd@10', 'office11@yopmail.com', 0, '165121', 'PENDING', 'ACTIVE', 0, '2024-02-14 13:37:16.610282', NULL),
(6, 'dddddd@10', 'office12@yopmail.com', 0, '273898', 'PENDING', 'ACTIVE', 0, '2024-02-14 13:37:34.198110', NULL),
(7, 'dddddd@10', 'office4@yopmail.com', 0, '', 'VERIFIED', 'ACTIVE', 0, '2024-02-15 04:24:08.071000', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_log`
--

CREATE TABLE `user_log` (
  `id` int(11) NOT NULL,
  `user_id_fk` int(11) NOT NULL,
  `key` varchar(255) NOT NULL,
  `privs` varchar(10) NOT NULL,
  `id_status` enum('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `is_deleted` tinyint(4) NOT NULL DEFAULT 0,
  `added_on` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `deleted_on` timestamp(6) NULL DEFAULT NULL ON UPDATE current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_log`
--

INSERT INTO `user_log` (`id`, `user_id_fk`, `key`, `privs`, `id_status`, `is_deleted`, `added_on`, `deleted_on`) VALUES
(1, 1, '398af436-75bb-4433-963d-e36c93e7cef7', '', 'ACTIVE', 0, '2024-02-14 04:29:53.130261', NULL),
(2, 1, 'a16a58cd-7fbb-4705-ba74-c4ec0bc2afc7', '', 'ACTIVE', 0, '2024-02-14 06:28:26.742280', NULL),
(3, 2, '97139189-f1e8-4306-abec-8fc823867b67', '', 'ACTIVE', 0, '2024-02-14 08:15:14.881082', NULL),
(4, 3, '3bf3c711-0e98-45f4-8417-ae1e4053b2a6', '', 'ACTIVE', 0, '2024-02-14 08:17:10.780447', NULL),
(5, 4, 'c2f3babc-ce27-4673-9cc7-b8d8e44fab1e', '', 'ACTIVE', 0, '2024-02-14 08:19:07.515956', NULL),
(6, 1, 'b6541c56-04bc-4215-a554-39550d64c6ad', '', 'ACTIVE', 0, '2024-02-14 12:26:50.443989', NULL),
(7, 1, '53fad240-542d-46f9-8c5b-35f31cca0e95', '', 'ACTIVE', 0, '2024-02-14 12:27:09.880371', NULL),
(8, 5, '677b7950-aa7b-4d69-aeb8-2eff05c0cfdb', '', 'ACTIVE', 0, '2024-02-14 13:37:16.635420', NULL),
(9, 6, 'fbc4563b-44cb-48d5-8e9f-dea45f0cb61e', '', 'ACTIVE', 0, '2024-02-14 13:37:34.236386', NULL),
(10, 2, '0f9b37d5-a5cd-4ee3-9b15-b59c2070eb9b', '', 'ACTIVE', 0, '2024-02-14 14:17:07.540626', NULL),
(11, 2, 'cdbac5e7-bf71-4057-90e8-f1aa9214415a', '', 'ACTIVE', 0, '2024-02-14 14:17:26.612734', NULL),
(12, 2, '9e17d694-1d0f-446f-af20-c91173ee09cc', '', 'ACTIVE', 0, '2024-02-15 04:15:39.293491', NULL),
(13, 7, '6ee8821e-9486-43d4-a251-5ad02162ee19', '', 'ACTIVE', 0, '2024-02-15 04:24:08.088536', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `document_types`
--
ALTER TABLE `document_types`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `executive`
--
ALTER TABLE `executive`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `executive_log`
--
ALTER TABLE `executive_log`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `marital_status`
--
ALTER TABLE `marital_status`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `profile`
--
ALTER TABLE `profile`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `provinces`
--
ALTER TABLE `provinces`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `taxfile`
--
ALTER TABLE `taxfile`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `taxfile_status`
--
ALTER TABLE `taxfile_status`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `taxfile_status_log`
--
ALTER TABLE `taxfile_status_log`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user_log`
--
ALTER TABLE `user_log`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `documents`
--
ALTER TABLE `documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `document_types`
--
ALTER TABLE `document_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `executive`
--
ALTER TABLE `executive`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `executive_log`
--
ALTER TABLE `executive_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `marital_status`
--
ALTER TABLE `marital_status`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `profile`
--
ALTER TABLE `profile`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `provinces`
--
ALTER TABLE `provinces`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `taxfile`
--
ALTER TABLE `taxfile`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `taxfile_status`
--
ALTER TABLE `taxfile_status`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `taxfile_status_log`
--
ALTER TABLE `taxfile_status_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `user_log`
--
ALTER TABLE `user_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
