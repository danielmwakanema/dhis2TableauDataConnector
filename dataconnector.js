function getDhis2Data(username = "", password = "") {
  const _url = "PATH_TO_INDICATORS_HERE";
  const hash = btoa(`${username}:${password}`);

  const _authHeader = { Authorization: `Basic ${hash}` };
  return fetch(_url, _authHeader);
}

function schemaObject(columns = {}) {
  return {
    id: "dhis2AnalyticsFeed",
    alias: "Tableau DHIS2 health indicators.",
    columns: columns,
  };
}

(function () {
  // Create the connector object
  const myConnector = tableau.makeConnector();
  let _headers = [];
  let _data = [];

  // Define the schema
  myConnector.getSchema = async function (schemaCallback) {
    getDhis2Data(tableau.username, tableau.password)
      .then((data) => data.json())
      .then((data) => {
        _data = data.rows;
        _headers = data.headers.map((hd) =>
          hd.name.toUpperCase().split(" ").join("_")
        );
        const columns = _headers.map((header) => ({
          id: header,
          dataType: tableau.dataTypeEnum.string,
        }));
        schemaCallback([schemaObject(columns)]);
      })
      .catch(console.error);
  };

  // Download the data
  myConnector.getData = (table, doneCallback) => {
    const tableData = [];
    _data.forEach((row) => {
      const cache = {};
      row.forEach((val, idx) => {
        cache[_headers[idx]] = val;
      });
      tableData.push(cache);
    });

    table.appendRows(tableData);
    doneCallback();
  };

  // Init function for connector, called during every phase
  myConnector.init = function (initCallback) {
    tableau.authType = tableau.authTypeEnum.basic;
    initCallback();
  };

  tableau.registerConnector(myConnector);

  // Create event listeners for when the user submits the form
  $(document).ready(function () {
    $("#submitButton").click(function () {
      tableau.connectionName = "DHIS2 COVID-19 Indicators"; // This will be the data source name in Tableau
      tableau.submit(); // This sends the connector object to Tableau
    });
  });
})();
