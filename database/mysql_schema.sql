/*
 *  Create MySQL database 'review_db' and its tables
 *  Run this script from inside mysql:
 *  mysql> source mysql_schema.sql
 */

/*
 *  clean up
 */
DROP DATABASE IF EXISTS shinshinop;

/*
 *  create database
 */
CREATE DATABASE IF NOT EXISTS shinshinop CHARACTER SET utf8;

/*
 *  create tables
 */
USE shinshinop;

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

CREATE USER 'shinshinop'@'localhost' IDENTIFIED BY 'shin2011OpDb';

GRANT USAGE ON shinshinop.* TO shinshinop@localhost;
GRANT SELECT,INSERT,DELETE,UPDATE ON shinshinop.* TO shinshinop@localhost;

