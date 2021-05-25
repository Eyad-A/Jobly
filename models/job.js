"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs */

class Job {
    /**
     * Create a job, update the db, and return new job data
     * Data should be {title, salary, equity, companyHandle}
     * Returns {id, title, salary, equity, companyHandle}
     */

    static async create(data) {
        const results = await db.query(
            `INSERT INTO jobs
            (title, 
            salary, 
            equity, 
            company_handle)
            VALUES($1, $2, $3, $4)
            RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
            [data.title,
            data.salary,
            data.equity,
            data.companyHandle,]);
        let job = results.rows[0];
        return job;
    }


    /**
     * Find all jobs (include optional filters)
     * - minSalary
     * - hasEquity
     * - title (case-insensitive, partial matches)
     * Returns [{id, title, salary, equity, companyHandle, companyName}]
     */

    static async findAll({ minSalary, hasEquity, title } = {}) {
        let query = `SELECT j.id,
                            j.title,
                            j.salary,
                            j.equity,
                            j.company_handle AS "companyHandle",
                            c.name AS "companyName"
                    FROM jobs j 
                    LEFT JOIN companies AS c
                    ON c.handle = j.company_handle`;
        let whereClause = [];
        let queryValues = [];

        if (minSalary !== undefined) {
            queryValues.push(minSalary);
            whereClause.push(`salary >= $${queryValues.length}`);
        }

        if (hasEquity === true) {
            whereClause.push(`equity > 0`);
        }

        if (title !== undefined) {
            queryValues.push(`%${title}%`);
            whereClause.push(`title ILIKE $${queryValues.length}`);
        }

        if (whereClause.length > 0) {
            query += " WHERE " + whereClause.join(" AND ");
        }

        query += " ORDER BY title";
        const jobsResp = await db.query(query, queryValues);
        return jobsResp.rows;
    }


    /**
     * Given a job id, return data about the job 
     * Returns {id, title, salary, equity, company_handle, company}
     * where company is { handle, name, description, numEmployees, logoUrl}
     */

    static async get(id) {
        const jobResp = await db.query(
            `SELECT id, 
                    title,
                    salary,
                    equity,
                    company_handle AS "companyHandle"
            FROM jobs 
            WHERE id = $1`, [id]);

        const job = jobResp.rows[0];
        if (!job) throw new NotFoundError(`No job found with the id of ${id}`);

        const companiesResp = await db.query(
            `SELECT handle,
                    name,
                    description,
                    num_employees AS "numEmployees",
                    logo_url AS "logoUrl"
             FROM companies
             WHERE handle = $1`, [job.companyHandle]);

        delete job.companyHandle;
        job.company = companiesResp.rows[0];
        return job;
    }


    /**
     * Partially update data with {title, salary, equity}
     * Returns {id, title, salary, equity, company_handle}     * 
     */

    static async update(id, data) {
        const { setCols, values } = sqlForPartialUpdate(data, {});
        const idVarIdx = "$" + (values.length + 1);
        const querySql = `UPDATE jobs 
                          SET ${setCols}
                          WHERE id = ${idVarIdx}
                          RETURNING id, title, salary, equity, company_handle AS "companyHandle"`;
        const results = await db.query(querySql, [...values, id]);
        const job = results.rows[0];

        if (!job) throw new NotFoundError(`No job found with the id ${id}`);
        return job;
    }


    /**
     * Deletes a given job from the db and returns undefined
     */

    static async remove(id) {
        const results = await db.query(
            `DELETE FROM jobs 
            WHERE id = $1 
            RETURNING id`, [id]);
        const job = results.rows[0];

        if (!job) throw new NotFoundError(`No job found with the id ${id}`);
    }
}


module.exports = Job;