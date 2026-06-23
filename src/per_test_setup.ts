// Applied to all test modules
import { sql } from "./backend/commands/sql.ts";
import test from "node:test";

test.after(() => sql.end());
