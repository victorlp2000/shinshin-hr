/*
 *  Create MySQL database 'review_db' and its tables
 *  Run this script from inside mysql:
 *  mysql> source mysql_schema.sql
 */

/*
 *  clean up
 */
DROP DATABASE IF EXISTS shinshin_hr;

/*
 *  create database
 */
CREATE DATABASE IF NOT EXISTS shinshin_hr CHARACTER SET utf8;

/*
 *  create tables
 */
USE shinshin_hr;

CREATE TABLE IF NOT EXISTS hr_volunteer (
    id              INTEGER NOT NULL AUTO_INCREMENT,
    first_name      CHAR(40),
    last_name       CHAR(40),
    name            CHAR(255),
    photo_file      CHAR(255),
    description     CHAR(255),
    PRIMARY KEY (id)
    );
DESCRIBE hr_volunteer;

CREATE TABLE IF NOT EXISTS hr_role (
    id              INTEGER AUTO_INCREMENT,
    code            CHAR(20),
    role            CHAR(30),
    volunteer_id    INTEGER NULL,
    FOREIGN KEY (volunteer_id) REFERENCES hr_volunteer(id),
    PRIMARY KEY (id)
    );
DESCRIBE hr_role;

SHOW TABLES;

/*
 *  grant access rights
 */
/*
CREATE USER 'vliu'@'localhost' IDENTIFIED BY 'vliupass';
*/
GRANT USAGE ON shinshin_hr.* TO vliu@localhost;
GRANT SELECT,INSERT,DELETE,UPDATE ON shinshin_hr.* TO vliu@localhost;

