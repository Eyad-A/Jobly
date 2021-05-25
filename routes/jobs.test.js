"use strict";

const request = require("supertest");

const app = require("../app");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    testJobIds,
    u1Token,
    adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


/************* POST /jobs */

describe("POST /jobs", function () {
    test("admin can post a job", async function () {
        const resp = await request(app)
            .post(`jobs`)
            .send({
                companyHandle: "c1",
                title: "Software Engineer",
                salary: 80,
                equity: "0.1",
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({
            job: {
                id: expect.any(Number),
                title: "Software Engineer",
                salary: 80,
                equity: "0.1",
                companyHandle: "c1",
            },
        });
    });
});


/***************** GET /jobs */

describe("GET /jobs", function () {
    test("get jobs without filtering", async function () {
        const resp = await request(app).get(`/jobs`);
        expect(resp.body).toEqual({
            jobs: [
                {
                    id: expect.any(Number),
                    title: "J1",
                    salary: 1,
                    equity: "0.1",
                    companyHandle: "c1",
                    companyName: "C1",
                },
                {
                    id: expect.any(Number),
                    title: "J2",
                    salary: 2,
                    equity: "0.2",
                    companyHandle: "c1",
                    companyName: "C1",
                },
                {
                    id: expect.any(Number),
                    title: "J3",
                    salary: 3,
                    equity: null,
                    companyHandle: "c1",
                    companyName: "C1",
                },
            ],
        },
        );
    });

    test("get jobs with filtering", async function () {
        const resp = await request(app).get(`/jobs`).query({ hasEquity: true });
        expect(resp.body).toEqual({
            jobs: [
                {
                    id: expect.any(Number),
                    title: "J1",
                    salary: 1,
                    equity: "0.1",
                    companyHandle: "c1",
                    companyName: "C1",
                },
                {
                    id: expect.any(Number),
                    title: "J2",
                    salary: 2,
                    equity: "0.2",
                    companyHandle: "c1",
                    companyName: "C1",
                },
            ],
        },
        );
    });
});


/************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
    test("anon can get a specific job", async function () {
        const resp = await request(app).get(`/jobs/${testJobIds[0]}`);
        expect(resp.body).toEqual({
            job: {
                id: testJobIds[0],
                title: "J1",
                salary: 1,
                equity: "0.1",
                company: {
                    handle: "c1",
                    name: "C1",
                    description: "Desc1",
                    numEmployees: 1,
                    logoUrl: "http://c1.img",
                },
            },
        });
    });
});


/*************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
    test("patch a job works for admin", async function () {
        const resp = await request(app)
            .patch(`/jobs/${testJobIds[0]}`)
            .send({ title: "Project Manager" })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.body).toEqual({
            job: {
                id: expect.any(Number),
                title: "J-New",
                salary: 1,
                equity: "0.1",
                companyHandle: "c1",
            },
        });
    });
});

/********* DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
    test("admin can delete a job", async function () {
        const resp = await request(app)
            .delete(`/jobs/${testJobIds[0]}`)
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.body).toEqual({ deleted: testJobIds[0] });
    });
});