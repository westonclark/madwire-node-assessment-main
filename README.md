# Madwire Node Assessment

## Instructions for Running Code

1. Ensure Node v20 is installed.
2. `yarn install`
3. copy `.env.template` to `.env` and adjust values accordingly.
4. Ensure Docker is installed.
5. `yarn start-db`
6. `yarn test` (some tests will fail)
7. `yarn dev` will start the api locally.

## Task Instructions

Complete the list employees endpoint `GET /employees`.
This endpoint should do the following:

- Return employees. by default limit the number to 10 employees.
- Accept a query parameter `limit` that defines the number of records to return.
- Accept a query parameter `title` that returns only employees with the given title.
- If the query parameter `title` is present, also return the title of the employee in the response.

There are already integration tests for the endpoint. Running `yarn test` until all tests pass will ensure the endpoint fulfills minimum requirements.

If you find anything that you feel can be changed or improved in the code, please feel free to change it.
If there is anything that can be done to improve the assessment overall please give us the feedback!

## Technology Used

#### Fastify

- This api uses the web api framework fastify. You can find the documentation [here](https://fastify.dev/docs/latest/)

#### Knex.js

- This api uses knex.js to build and execute queries against the MySQL Database. Documentation can be found [here](https://fastify.dev/docs/latest/)

#### MySQL Database

- The database for this API is a MySQL database, version 5.7. Documentation can be found [here](https://dev.mysql.com/doc/refman/5.7/en/)
  Documentation for the docker container containing the databse can be found [here](https://hub.docker.com/r/genschsa/mysql-employees)

##### Database Schema

The database for this API is using the sample MySQL employees database. The schema for this database can be found [here](https://dev.mysql.com/doc/employee/en/sakila-structure.html)
