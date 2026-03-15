import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ManualPaymentRecord {
    method: string;
    principal: Principal;
    verified: boolean;
    timestamp: bigint;
    transactionId: string;
}
export interface CalcRecord {
    id: bigint;
    item: string;
    difference: number;
    investment: number;
    sector: string;
    sales: number;
    timestamp: bigint;
    resultType: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface YearlySummary {
    totalInvestment: number;
    totalLoss: number;
    totalProfit: number;
    totalSales: number;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Subscriber {
    status: SubscriptionStatus;
    principal: Principal;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface UserProfile {
    name: string;
    language: string;
}
export enum SubscriptionStatus {
    active = "active",
    inactive = "inactive"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    accessCalculator(_calculatorType: string): Promise<boolean>;
    activateSubscription(userPrincipal: Principal, paymentSessionId: string): Promise<boolean>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    calculateCropYield(area: number, _cropType: string): Promise<number>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    deactivateSubscription(userPrincipal: Principal): Promise<void>;
    deleteCalcRecord(id: bigint): Promise<void>;
    getAllSubscribers(): Promise<Array<Subscriber>>;
    getCalcHistory(): Promise<Array<CalcRecord>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getManualPayments(): Promise<Array<ManualPaymentRecord>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getYearlySummary(): Promise<YearlySummary>;
    isCallerAdmin(): Promise<boolean>;
    isCallerSubscribed(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    saveCalcRecord(sector: string, item: string, investment: number, sales: number, difference: number, resultType: string): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    submitManualPayment(transactionId: string, method: string): Promise<boolean>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}
