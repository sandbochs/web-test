## Wisely Web Test

# Steps

- run `docker-compose up`

# Requirements
There are three main requirements to consider:
- Restaurants should be able to define how many reservations of a specific party size to take every 15 minutes.
- Restaurants should be able to book a reservation on behalf of guests.
- Reservations should never exceed inventory.
- Inventory should be configurable via a range.

# Questions
- Should the application handle multiple restaurants? (Not a hard requirement)
- Is concurrency when booking a reservation an issue? (No)
- Should restaurants be allowed to update / delete inventory? (Not a hard requirement)
- Should a party of 1 be allowed to book a table for 6? (Yes)

# Approach
## Data Model
inventories / InventoryModel
- id serial
- startTime time
- endTime time
- maxSize integer
- maxParties integer
- createdAt

reservations / ReservationModel
- id serial
- name text
- email text
- size integer
- date date
- time time // duplicated data
- createdAt

### Tradeoffs
Duplicating the time column in the reservations table introduces the possibility of the column desyncing from the related inventory row. While this is not an issue since there is no requirement to update existing inventories, it can be handled by an application enforced constrait where inventories with existing reservations cannot update the time column. From a product pov, this also makes sense because restaurants wouldn't want to change reservation times without reaching out to the customer first. Data duplication also takes additional space, but adding a single 8 byte column shouldn't be an issue.

The benefits gained are as follows:
- Cleaner REST API where the create reservation route can respond with a ReservationModel.
- Eliminates the need to join on inventories to get time, speeding queries where the search field is time.

This could very much be a premature optimization, but the cost to reverse this potential tech debt is quite low. See the [Postgres docs](https://www.postgresql.org/docs/current/sql-altertable.html#SQL-ALTERTABLE-NOTES) on the performance cost of dropping a database column.

## API
### Error Codes
Error responses will include the error (string) and code (integer) properties. The code property is in addition to the HTTP status code and is unique for each type of error. For ex:
```js
{
  message: 'Invalid Time',
  code: 1000,
}
```

## Routes
### Create Inventory
`POST /inventories`

#### Body
```js
{
  startTime: ISO-8601 time string, // Format: HH:MM API expects UTC timezone
  endTime: ISO-8601 time string, // Format: HH:MM API expects UTC timezone
  maxSize: number, // max number of guests for a reservation
  maxParties: number, // max number of reservations allowed to be booked during this timeslot and party size
}
```

#### Response
`200` - Successful creation of inventory
```js
{
  ...InventoryModel
}

```

#### Errors
`400` Status Code Errors


```js
{ code: 500, error: `'time' must be a ISO-8601 date string formatted as HH:MM` }
```

```js
{ code: 1000, error: 'Invalid time, reservations can only be accepted in 15 minute intervals' }
```

```js
{ code: 1001, error: 'Inventory already exists for the specified time and party size' }
```

```js
{ code: 1002, error: `'time' and 'maxSize' must be provided` }
```

```js
{ code: 1003, error: `'maxSize' must be a number` }
```

```js
{ code: 1004, error: `'maxParties' must be a number` }
```

### Create Reservation
`POST /reservations`

#### Body
```js
{
  name: string, // guest name
  email: string, // guest email
  size: number, // number in party
  date: string, // Format: YYYY-MM-DD
  time: ISO-8601 time string, // Format: HH:MM API expects UTC timezone
}
```

#### Response
`200` - Successful reservation
```js
{
  ...ReservationModel
}
```

#### Errors
`400` Status Code Errors

```js
{ code: 1100, error: 'Inventory not configured for that time' }
```

```js
{ code: 1101, error: 'No more reservations available for that time' }
```

## Ensuring inventory is not overbooked
Since we don't have to worry about concurrency this is quite straight forward. The following pseudocode describes how we can enforce this constraint:

```js
const inventory = await query('select id, max_size, max_parties from inventories where size <= max_size and time = time;');
const reservationCount = await query('select count(id) from reservations where date = date and time = time;');
if (reservationCount >= inventory.maxSize) {
  throw HTTPError(400, 'Inventory unavailable');
}

const reservation = await query('insert into reservations (date, time) values (date, time)');
```

# Extensability
TODO
