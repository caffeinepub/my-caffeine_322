import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Time "mo:core/Time";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type SubscriptionStatus = { #active; #inactive };
  type Subscriber = { principal : Principal; status : SubscriptionStatus };
  let subscribers = Map.empty<Principal, SubscriptionStatus>();

  // Manual payment records for bKash/Nagad
  type ManualPaymentRecord = {
    principal : Principal;
    transactionId : Text;
    method : Text;
    timestamp : Int;
    verified : Bool;
  };
  let manualPayments = Map.empty<Principal, ManualPaymentRecord>();

  public type UserProfile = {
    name : Text;
    language : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  var stripeConfig : ?Stripe.StripeConfiguration = null;

  func requireAndGetStripeConfig() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe not configured.") };
      case (?conf) { conf };
    };
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("[STRIPE] setStripeConfiguration Unauthorized: Only admins can set configuration!");
    };
    stripeConfig := ?config;
  };

  public query func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    let conf = requireAndGetStripeConfig();
    await Stripe.getSessionStatus(conf, sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    let conf = requireAndGetStripeConfig();
    await Stripe.createCheckoutSession(conf, caller, items, successUrl, cancelUrl, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  func requireActiveSubscription(caller : Principal) : () {
    switch (subscribers.get(caller)) {
      case (?#active) {};
      case (_) { Runtime.trap("[SUBSCRIBE] requireActiveSubscription Unauthorized: Not an active subscriber!") };
    };
  };

  public query ({ caller }) func isCallerSubscribed() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return false;
    };
    switch (subscribers.get(caller)) {
      case (?#active) { true };
      case (_) { false };
    };
  };

  public query ({ caller }) func getAllSubscribers() : async [Subscriber] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("[SUBSCRIBE] getAllSubscribers Unauthorized: Only admins can view this!");
    };
    subscribers.entries().toArray().map(func((p, s)) { { principal = p; status = s } });
  };

  public shared ({ caller }) func submitManualPayment(transactionId : Text, method : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only logged-in users can submit payments");
    };
    if (transactionId.size() < 4) {
      Runtime.trap("Invalid transaction ID");
    };
    manualPayments.add(caller, {
      principal = caller;
      transactionId = transactionId;
      method = method;
      timestamp = 0;
      verified = false;
    });
    subscribers.add(caller, #active);
    true;
  };

  public query ({ caller }) func getManualPayments() : async [ManualPaymentRecord] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("[SUBSCRIBE] Unauthorized: Only admins can view payment records!");
    };
    manualPayments.entries().toArray().map(func((_, r)) { r });
  };

  public shared ({ caller }) func activateSubscription(userPrincipal : Principal, paymentSessionId : Text) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("[SUBSCRIBE] activateSubscription Unauthorized: Only admins can activate subscriptions!");
    };
    let config = requireAndGetStripeConfig();
    let status = await Stripe.getSessionStatus(config, paymentSessionId, transform);
    switch (status) {
      case (#completed { response = _; userPrincipal = _verifiedPrincipal }) {
        subscribers.add(userPrincipal, #active);
        true;
      };
      case (_) {
        Runtime.trap("[SUBSCRIBE] Payment verification failed!");
      };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func accessCalculator(_calculatorType : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only logged-in users can access calculators");
    };
    requireActiveSubscription(caller);
    true;
  };

  public query ({ caller }) func calculateCropYield(area : Float, _cropType : Text) : async Float {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only logged-in users can use calculators");
    };
    requireActiveSubscription(caller);
    area * 2.5;
  };

  public shared ({ caller }) func deactivateSubscription(userPrincipal : Principal) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("[SUBSCRIBE] deactivateSubscription Unauthorized: Only admins can deactivate subscriptions!");
    };
    subscribers.add(userPrincipal, #inactive);
  };

  // Calculation history feature
  public type CalcRecord = {
    id : Nat;
    sector : Text;
    item : Text;
    investment : Float;
    sales : Float;
    difference : Float;
    resultType : Text;
    timestamp : Int;
  };

  public type YearlySummary = {
    totalInvestment : Float;
    totalSales : Float;
    totalProfit : Float;
    totalLoss : Float;
  };

  let calcHistories = Map.empty<Principal, Map.Map<Nat, CalcRecord>>();
  var nextRecordId = 1;

  public shared ({ caller }) func saveCalcRecord(sector : Text, item : Text, investment : Float, sales : Float, difference : Float, resultType : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only logged-in users can save calc records");
    };
    requireActiveSubscription(caller);

    let record : CalcRecord = {
      id = nextRecordId;
      sector;
      item;
      investment;
      sales;
      difference;
      resultType;
      timestamp = Time.now();
    };

    let userHistory = switch (calcHistories.get(caller)) {
      case (null) { Map.empty<Nat, CalcRecord>() };
      case (?history) { history };
    };

    userHistory.add(nextRecordId, record);
    calcHistories.add(caller, userHistory);

    nextRecordId += 1;
    record.id;
  };

  public query ({ caller }) func getCalcHistory() : async [CalcRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only logged-in users can access calc history");
    };
    requireActiveSubscription(caller);

    switch (calcHistories.get(caller)) {
      case (null) { [] };
      case (?history) {
        let now = Time.now();
        let oneYearNanos = 365 * 24 * 60 * 60 * 1_000_000_000;
        let filtered = history.values().toArray().filter(
          func(r) {
            r.timestamp >= (now - oneYearNanos : Int);
          }
        );
        filtered.reverse();
      };
    };
  };

  public shared ({ caller }) func deleteCalcRecord(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only logged-in users can delete calc records");
    };
    requireActiveSubscription(caller);

    switch (calcHistories.get(caller)) {
      case (null) {
        Runtime.trap("Calculation record does not exist");
      };
      case (?history) {
        if (not history.containsKey(id)) {
          Runtime.trap("Calculation record does not exist");
        };
        history.remove(id);
        calcHistories.add(caller, history);
      };
    };
  };

  public query ({ caller }) func getYearlySummary() : async YearlySummary {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only logged-in users can access yearly summary");
    };
    requireActiveSubscription(caller);

    var totalInvestment = 0.0;
    var totalSales = 0.0;
    var totalProfit = 0.0;
    var totalLoss = 0.0;

    let now = Time.now();
    let oneYearNanos = 365 * 24 * 60 * 60 * 1_000_000_000;

    switch (calcHistories.get(caller)) {
      case (null) {};
      case (?history) {
        history.values().forEach(
          func(record) {
            if (record.timestamp >= (now - oneYearNanos : Int)) {
              totalInvestment += record.investment;
              totalSales += record.sales;
              if (record.difference > 0) {
                totalProfit += record.difference;
              } else {
                totalLoss += record.difference;
              };
            };
          }
        );
      };
    };

    {
      totalInvestment;
      totalSales;
      totalProfit;
      totalLoss;
    };
  };

  // Government price management
  public type GovPriceEntry = {
    sector : Text;
    item : Text;
    price : Float;
    unit : Text;
    qty : Float;
  };

  let govPrices = Map.empty<Text, GovPriceEntry>();

  func govPriceKey(sector : Text, item : Text) : Text {
    sector # "#" # item;
  };

  public shared ({ caller }) func setGovPrice(sector : Text, item : Text, price : Float, unit : Text, qty : Float) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can set government prices");
    };
    govPrices.add(govPriceKey(sector, item), { sector; item; price; unit; qty });
  };

  public shared ({ caller }) func setAllGovPrices(entries : [GovPriceEntry]) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can set government prices");
    };
    for (entry in entries.vals()) {
      govPrices.add(govPriceKey(entry.sector, entry.item), entry);
    };
  };

  public query func getGovPrices() : async [GovPriceEntry] {
    govPrices.values().toArray();
  };
};
