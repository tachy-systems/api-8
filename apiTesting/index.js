const axios = require("axios");
const chai = require("../src/node_modules/chai");
const fetchData = require("./helper/getAllApis");
const expect = chai.expect;

const headers = {
  authorization:
    "YTUzODhlYWYzNmNjMjAwYjViYWYyYjNiZWUyOGEzMzdkOTQ3NDUxYWQ1YWY2YjM3MGI0MjM1YTA1MWVlOWRlZTRhZDhjMDBjMWVkZjY0NjRkZjIwNDVlNTZhZWYzM2EyNWNhMDQ0OWQ3YzcxZjJjMmUwNmI3OGI0MTZkNGI2NWE5MGYyNjIxMzdiNzUxZmJhN2ZmYzkxMTg5MGE3NjBkYzNlNDc3OWFmOWQ3Zjc4OWQ0NGE3NDFjNDE2Y2FlZjU3ZDE5MTAxN2U1ODE0MGE1OWZkZGE1YTJhOWZlMjczOGYyN2NjODlkYmJkN2UwZWI1NDYyZjAwM2RmNTBiMGMwYzYwMDlmNDc0M2Y0YjY5MTBkNTljODI5ODcyNmM4YzhlNmJhM2NmN2Q5ODJlNWYxNmZmNTUwNTMwOGI3MDRmOTJlOWRmYzkyZGU2MzhlOTI3MDBiYWQxOTA0ODcxOWYyZGYxOWJmY2Y0OThiNjg4ZmEwZmZjMTYxNzhhNGM2Y2FjZjA4ZWI3NjI3ODc4ZmRiZmYyN2RjMmUyZGJhMDk5OTc4NzJiODJhYzljNGVmN2RlM2Y3YWUxN2RlMTZlNmFhNg==",
  origin: "www.voais.io",
  "x-correlation-id": "987654321",
  "x-app-os": "android",
  "x-app-version": "4.11.x",
  "x-app-name": "TalkSite",
  "x-app-country": "au",
  "x-device-id": "1234",
  "api-sharedsecret": "fe8e5b73-b538-46c2-8ee4-b7260925d146",
  "x-client-id": "3fbf31061aec4534b8989151e354b9c9",
  "x-client-secret": "7F22b78a4b8a4f0eb2ac052E3C3b40bA",
  "content-type": "application/json",
};

  const getServices = async () => {
    return new Promise(resolve => {
      setTimeout(resolve, 3000, fetchData());
    });
  }

  (async function () {
    const services = await getServices();

    describe("GET API Request Tests", async () => {
      console.log(services);
        services.data.services.forEach((service) => {
          it(`Test case of ${service.serviceId}`, async () => {
            try {
              const options = {
                url: service.url,
                method: service.method,
                headers,
                data: { body: JSON.stringify({}) },
              };
              const res = await axios(options);
              expect(res.status).to.equal(403);
            } catch (error) {
              console.log("Error happened: ", error);
              console.log(error.response.data);
              expect(error.response.status).to.equal(403);
            }
          });
        });
    })
    run();
  })();