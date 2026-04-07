-- Migration Script: Add mobile column to admins table if it does not exist
-- This ensures the system does not delete existing tables or data

DELIMITER $$
CREATE PROCEDURE AddMobileToAdminsIfNotExist()
BEGIN
    DECLARE num_cols INT;

    SELECT count(*)
    INTO num_cols
    FROM information_schema.columns
    WHERE table_name = 'admins' 
      AND table_schema = DATABASE() 
      AND column_name = 'mobile';

    IF num_cols = 0 THEN
        ALTER TABLE admins ADD COLUMN mobile VARCHAR(255);
    END IF;
END $$
DELIMITER ;

CALL AddMobileToAdminsIfNotExist();
DROP PROCEDURE AddMobileToAdminsIfNotExist;
