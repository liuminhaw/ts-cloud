/**
 * Server-side scripting
 * Controlling CloudSQL transaction
 */

 /**
  * Using server script to control Cloud SQL transaction
  * @param {Number} orderKey - Key value of a record in database 
  */
function submitOrder(orderKey) {

  // Sets a rollback point and starts a new transaction.
  app.transaction.cloudSql.start();

   // Locks all records that are read in the transaction until the end of the transaction.
  app.transaction.cloudSql.setLockOnRead(app.transaction.cloudSql.lockOnRead.UPDATE);

  var orderQuery = app.models.Orders.newQuery();
  orderQuery.filters._key._equals = orderKey;
  var order = orderQuery.run()[0];
  console.log("orderKey = " + orderKey);


  // Read related order product requirements
  var requireComponents = order.Products.Requirements;
  
  var components = [];
  console.log("requireComponent length: " + requireComponents.length);
  for (var i = 0; i < requireComponents.length; i++) {
    // Read related component
    console.log("Show index i: " + i);
    var component = requireComponents[i].Components;
    
    // Server logs
    console.log("Stock quantity: " + component.stockQuantity);
    console.log("Order requirement: " + requireComponents[i].amount * order.amount);
    
    if (component.stockQuantity < requireComponents[i].amount * order.amount) {
      // Insufficient stock to complete an order, transaction is rolled back
      app.transaction.cloudSql.rollback();
      throw new app.ManagedError("Not enough " + component.Name + " in stock.");
    }
    
    // Reduce in stock quantity
    console.log("Start reduce stock quantity");
    component.stockQuantity = component.stockQuantity - (requireComponents[i].amount * order.amount);
    console.log("Push component to array");
    components.push(component);
    console.log("Done");
  }
  
  console.log("order status = " + order.status + ". Change order status to Submitted");
  order.status = "Submitted";
  console.log("order status = " + order.status + " after change.");
  console.log("Save records components");
  app.saveRecords(components);
  console.log("Save records order");
  app.saveRecords([order]);
  console.log("Before return");
  
  //Order is successfully processed, database changes committed.
  app.transaction.cloudSql.commit();
  console.log("Database changes committed");
  
  return "Order submitted " + orderKey;
}
