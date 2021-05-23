const { sqlForPartialUpdate } = require("./sql");

describe("sqlForPartialUpdate", function() {
    test("It should wok for updating an item", function() {
        const results = sqlForPartialUpdate(
            {f1: "v1"},
            {f1: "f1", fF2: "f2"});
        expect(results).toEqual({
            setCols: "\"f1\"=$1",
            values: ["v1"],
        });        
    });
});