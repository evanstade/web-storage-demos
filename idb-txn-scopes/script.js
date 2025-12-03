let stopRecursing = {};
let recurseCount = 0;

const customerData = [
  { ssn: "444-44-4444", name: "Bill", age: 35, email: "bill@company.com" },
  { ssn: "555-55-5555", name: "Donna", age: 32, email: "donna@home.org" },
];

var createWriteAndRead = function(dbName) {
  const request = indexedDB.open(dbName, 2);

  request.onerror = (event) => {
    console.error("Database error: ", event);
  };
  request.onsuccess = (event) => {
    const db = event.target.result;
    if (db.name === 'db1') {
      writeToProviderStore(db);
    }
    writeToCustomerStore(db);
    read444(db);
  }
  request.onupgradeneeded = (event) => {
    const db = event.target.result;
    db.createObjectStore("providers", { keyPath: "ssn" });
    db.createObjectStore("customers", { keyPath: "ssn" });
  }
}

var writeToProviderStore = function (db) {
  const txn = db.transaction("providers", "readwrite");
  const providerObjectStore = txn.objectStore("providers");
  customerData.forEach((customer) => {
    providerObjectStore.put(customer);
  });
  var recurse = function(event) {
    if (!stopRecursing[db.name]) {
      var innerRequest = providerObjectStore.get("555-55-5555");
      innerRequest.onsuccess = recurse;
      innerRequest.onerror = (event) => {
        console.error("Database error: ", event);
      };
      if (++recurseCount == 1000) {
        stopRecursing[db.name] = true;
      }
    }
  };
  var request = providerObjectStore.get("555-55-5555");
  request.onsuccess = recurse;
  request.onerror = (event) => {
    console.error("Database error: ", event);
  };
}

var writeToCustomerStore = function (db) {
  const customerObjectStore = db
    .transaction("customers", "readwrite")
    .objectStore("customers");
  customerData.forEach((customer) => {
    customerObjectStore.put(customer);
  });
}

var read444 = function(db) {
  const transaction = db.transaction(["customers"]);
  const objectStore = transaction.objectStore("customers");
  const request = objectStore.get("444-44-4444");
  request.onsuccess = (event) => {
    stopRecursing[db.name] = true;
    let resultDiv = document.getElementById('result-' + db.name);
    resultDiv.classList.remove('lds-ring');
    if (recurseCount >= 1000) {
      document.getElementById('timed-out').hidden = false;
    } else {
      document.getElementById('finished').hidden = false;
    }
  };
}

createWriteAndRead("db1");
