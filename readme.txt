
steps:

1. create database and tables
    login to mysql as root:
        $ mysql -u root -p
    create database, tables and the user:
        mysql> source database/mysql_schema.sql

2. load volunteer data from SPM system
    create hr_volunteer.csv and hr_role.csv
    goto 'database' folder, run:
        $ node csv.js
    it will load both hr_volunteer.csv and hr_role.csv into tables 

interface:

database
========
    table: hr_volunteer
        - list all volunteer
        - fields:
            volunteer_id - id for the volunteer
            first_name
            last_name
            chinese_name
            photo_file
            description

    table: hr_role
        - assignment for each position
        - fields:
            code - devide into group columns
                . the first char is the group name
                . followed by level(s)
                'A'     - group 'A'
                'A#'    - tells how many columns for each level, here '1,2,3,1'
                        the top level uses 1 column ('A')
                        second level uses 2 columns ('01', 'aa', ...)
                        third level uses 3 columns ('001', '002', ...)
                        fouth level uses 1 column ('a')
                'A01'       - level 2, '01'
                'A01001'    - level 3, 3 columns: '001'
                'A01002'
                'A01002a'   - level 4, using 1 column
                'A01900'
                'Aaa'       - level 2, 'aa'
                'Aaa100'    - level 3, '100'

                . this code need to be sortable to keep structure

            role
            volunteer_id (point to id in hr_volunteer)

page url
========

    domain:port/shinshin.html
        - main page for shinshin hr team


APIs
====

    domain:port/api?role
        - get json data from database

    domain:port/api?photo=imgefilename
        - show photo image

