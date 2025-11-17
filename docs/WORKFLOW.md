# Order and Service Workflow

## Overview

This document explains how Orders and Services are interconnected and the workflow for managing them in the Water Purifier Service Platform.

## Key Concepts

### Order
- **Purpose**: Represents a customer's purchase of a product
- **Created by**: Admin or Staff
- **When created**: When a customer places an order for a water purifier product
- **Automatic actions**: 
  - An invoice is automatically generated when an order is created
  - Order status starts as "PENDING"

### Service
- **Purpose**: Represents a service appointment/visit for installation, maintenance, or quarterly service
- **Created by**: Admin or Staff
- **Types**: 
  - **MANUAL**: One-time service (e.g., installation, repair)
  - **QUARTERLY**: Recurring quarterly maintenance service
- **Can be linked to**: An Order (optional, for services related to a specific order)
- **Status flow**: AVAILABLE → ASSIGNED → IN_PROGRESS → COMPLETED

### Technician
- **Purpose**: Field worker who performs the actual service
- **Role**: Can only perform services, cannot create orders or services
- **Actions**: 
  - Accept available services
  - Update service status (IN_PROGRESS, COMPLETED)
  - Add completion notes

## Workflow

### 1. Order Creation Flow

```
Customer places order
    ↓
Admin/Staff creates Order
    ↓
System automatically:
  - Generates Invoice
  - Links Invoice to Order
  - Sets Order status to "PENDING"
    ↓
Order is ready for service scheduling
```

**Order Statuses:**
- **PENDING**: Order created, waiting for service to be scheduled
- **FULFILLED**: Service has been completed for this order
- **CANCELLED**: Order was cancelled

### 2. Service Creation Flow

```
Admin/Staff creates Service
    ↓
Service can be:
  - Linked to an Order (optional)
  - Assigned to a Technician (optional)
    ↓
If Technician assigned:
  - Status: "ASSIGNED"
  - Technician can see it in "Assigned Work"
    ↓
If no Technician assigned:
  - Status: "AVAILABLE"
  - Appears in Technician's "Available Services"
```

**Service Statuses:**
- **AVAILABLE**: Service created, no technician assigned yet
- **ASSIGNED**: Technician assigned, waiting to start
- **IN_PROGRESS**: Technician has started the service
- **COMPLETED**: Service finished, can generate/share invoice

### 3. Service Execution Flow (Technician)

```
Technician views Available Services
    ↓
Technician accepts service (or Admin/Staff assigns)
    ↓
Status changes to "ASSIGNED"
    ↓
Technician starts work
    ↓
Status changes to "IN_PROGRESS"
    ↓
Technician completes service
    ↓
Status changes to "COMPLETED"
    ↓
Invoice can be shared with customer
```

### 4. Order-Service Relationship

**When Service is linked to Order:**
- Service references the Order ID
- When service is completed, Order status can be updated to "FULFILLED"
- Invoice is already created from the Order, can be shared after service completion

**When Service is NOT linked to Order:**
- Standalone service (e.g., quarterly maintenance)
- Invoice may need to be generated separately if required

## Role-Based Access

### Admin
- ✅ Create/Edit/Delete Orders
- ✅ Create/Edit/Delete Services
- ✅ Assign Technicians to Services
- ✅ View all Orders, Services, Customers, Products
- ✅ Manage Staff and Technicians
- ✅ View all Invoices

### Staff
- ✅ Create/Edit Orders
- ✅ Create/Edit Services
- ✅ Assign Technicians to Services
- ✅ View all Orders, Services, Customers, Products
- ✅ View Technician availability
- ✅ View all Invoices
- ❌ Cannot delete Orders/Services
- ❌ Cannot manage Staff/Technicians

### Technician
- ✅ View Available Services
- ✅ Accept Services (change status from AVAILABLE to ASSIGNED)
- ✅ Update Service status (ASSIGNED → IN_PROGRESS → COMPLETED)
- ✅ Add completion notes
- ✅ View assigned and completed services
- ✅ Generate/View Invoices for completed services
- ❌ Cannot create Orders
- ❌ Cannot create Services
- ❌ Cannot assign other technicians
- ❌ Cannot view other technicians' work

## Best Practices

1. **Order First, Service Second**: 
   - Create order when customer purchases
   - Create service when scheduling installation/maintenance
   - Link service to order for tracking

2. **Technician Assignment**:
   - Assign technician during service creation for better planning
   - Or leave as AVAILABLE for technicians to self-assign

3. **Status Management**:
   - Keep services moving through statuses
   - Complete services promptly to update order status
   - Share invoices after service completion

4. **Quarterly Services**:
   - Create quarterly services in advance
   - Assign technicians based on availability
   - Track completion for customer satisfaction

## Data Relationships

```
Customer
  ├── Orders (1 to many)
  │     └── Invoice (1 to 1)
  └── Services (1 to many)
        ├── Order (many to 1, optional)
        ├── Technician (many to 1, optional)
        └── Product (many to 1)

Product
  ├── Orders (1 to many)
  └── Services (1 to many)

Technician
  └── Services (1 to many)
```

## Common Scenarios

### Scenario 1: New Customer Purchase
1. Admin/Staff creates Order for customer
2. Invoice automatically generated
3. Admin/Staff creates Service linked to Order
4. Admin/Staff assigns Technician
5. Technician completes service
6. Invoice shared with customer

### Scenario 2: Quarterly Maintenance
1. Admin/Staff creates Quarterly Service
2. Service can be linked to original Order (optional)
3. Admin/Staff assigns Technician or leaves as AVAILABLE
4. Technician accepts and completes service
5. Invoice generated/shared if needed

### Scenario 3: Standalone Service
1. Admin/Staff creates Manual Service (not linked to order)
2. Technician assigned or self-assigns
3. Technician completes service
4. Invoice generated separately if required

