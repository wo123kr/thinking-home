Understanding the ThinkingEngine (TE) backend's data rules is crucial for effective data transmission and troubleshooting. This document details the **data structure, data types, and data limitations** to help you configure data correctly and resolve data transfer issues.

-----

## Data Formatting for TE Backend

Whether you're using LogBus or a RESTful API to upload data, it must be formatted according to the data rules provided in this document.

### 1\. Data Structure

The TE backend accepts **JSON data** that conforms to its rules.

  * **SDK Usage:** If you're using an SDK, data is automatically converted and sent in JSON format.
  * **LogBus or POST Method:** Data uploaded via these methods must be in the correct JSON format.

JSON data is processed **line by line**. Each line represents a single JSON data entry, meaning one physical data item. In terms of meaning, this signifies a user performing one action or setting a user attribute once.

-----

### 2\. Data Format and Requirements

The following examples illustrate the required data formats. For readability, the data is formatted with line breaks, but in an actual environment, there should be no line breaks.

  * **Event Data Example:**

    ```json
    {
      "#account_id": "ABCDEFG-123-abc",
      "#distinct_id": "F53A58ED-E5DA-4F18-B082-7E1228746E88",
      "#type": "track",
      "#ip": "192.168.171.111",
      "#uuid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "#time": "2017-12-18 14:37:28.527",
      "#event_name": "test",
      "properties": {
        "argString": "abc",
        "argNum": 123,
        "argBool": true
      }
    }
    ```

  * **User Property Data Example:**

    ```json
    {
      "#account_id": "ABCDEFG-123-abc",
      "#distinct_id": "F53A58ED-E5DA-4F18-B082-7E1228746E88",
      "#type": "user_set",
      "#uuid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "#time": "2017-12-18 14:37:28.527",
      "properties": {
        "userArgString": "abc",
        "userArgNum": 123,
        "userArgBool": true
      }
    }
    ```

#### `#type` Value Descriptions

The `#type` value can be replaced with the following:

  * `user_setOnce`
  * `user_add`
  * `user_unset`
  * `user_append`
  * `user_del`

-----

### 3\. JSON Data Structure and Functionality

Each line of JSON data can be divided into two parts:

#### 3.1 Fields at the Same Level as `properties`

This section contains basic information about the data, including:

  * `#account_id`: Account ID of the user who triggered the data.
  * `#distinct_id`: Visitor ID who triggered the data.
  * `#time`: Trigger time (can be specified in seconds or milliseconds).
  * `#type`: Data type (event or user attribute setting).
  * `#event_name`: Event name (only included in event data).
  * `#ip`: User's IP address.
  * `#uuid`: Unique identifier for the data.

**Note:** Except for the items listed above, all attributes starting with `#` should be moved **inside** `properties`.

#### 3.2 Fields Inside `properties`

This section represents the actual content of the data.

  * It defines the **properties of an event** or the **user attributes to be set**.
  * These fields are directly used as attribute values or as analysis targets during analysis.

#### Structural Analogy

These two parts are similar to a **Header** and **Content** structure. The following sections explain the meaning of each field in detail.

-----

### 4\. Data Meta Information

The fields located at the same level as `properties` contain basic information about the user and the time the data was triggered. All fields start with `#`. This section summarizes the meaning and configuration methods for each field.

#### 4.1 User Information (`#account_id` and `#distinct_id`)

`#account_id` and `#distinct_id` are the two fields TE backend uses to identify users.

  * `#account_id`: Represents the user's ID when logged in.
  * `#distinct_id`: Unique identifier for the user when not logged in.

**TE Backend Operation Principle:**

  * It determines the user who triggered the data based on these two fields.
  * `#account_id` is prioritized for user identification. For detailed rules, refer to the relevant documentation.

**`#account_id` and `#distinct_id` Requirements:**

  * At least one of these two fields **must** be sent.
  * If all events are triggered only when a user is logged in, sending only `#account_id` is sufficient.
  * If events are triggered in a non-logged-in state (including before registration), it's recommended to send both fields.

#### 4.2 Data Type Information (`#type` and `#event_name`)

  * The `#type` field determines the data type, and every data point **must** have the `#type` field set.
  * `#type` values are categorized into two main groups:
    1.  **`track`**: Represents a record of user actions.
    2.  **Values starting with `user_`**: Indicate operations on user attributes.

**Detailed Meaning of `#type` Values:**

| Value               | Description                                                                                             |
| :------------------ | :------------------------------------------------------------------------------------------------------ |
| `track`             | Uploads an event to the event table. Used for all event uploads.                                        |
| `user_set`          | Overwrites one or more attributes in the user table. If a value exists, it's replaced with the new one. |
| `user_setOnce`      | Initializes one or more attributes in the user table. If a value already exists, it's ignored.          |
| `user_add`          | Accumulates one or more numeric attributes in the user table.                                           |
| `user_unset`        | Clears the value of one or more attributes for a specific user in the user table.                       |
| `user_del`          | Deletes a specific user from the user table.                                                            |
| `user_append`       | Adds an element to a list attribute in the user table.                                                  |
| `user_uniq_append`  | Adds an element to a list attribute in the user table, removes duplicates, and preserves existing order. |

**Configuration Rules Based on `#type` Value:**

1.  **`#type = track` (User Action Record):**
      * The `#event_name` field **must** be set.
      * `#event_name` Naming Rules:
          * Can only contain **alphabets** (case-sensitive), **numbers**, and **underscores (`_`)**.
          * **Must start with an alphabet**.
          * Maximum length is **50 characters**.
          * **No spaces** are allowed.
2.  **`#type = user_` (User Attribute Operations):**
      * The `#event_name` field is **not required**.

**Important Considerations:**

  * If `#event_name` is required, strictly adhere to the naming rules.
  * When performing user attribute modification operations, ensure no unnecessary fields are included.
  * User attributes represent fixed characteristics of a user.
      * It's **not recommended** to frequently change attributes within a short period.
      * For frequently changing attributes, it's recommended to set them as **event properties**.

#### 4.3 Trigger Time (`#time`)

`#time` is a field that represents the time an event occurred and **must** be set.

  * **Format:**
      * Milliseconds: `"yyyy-MM-dd HH:mm:ss.SSS"`
      * Seconds: `"yyyy-MM-dd HH:mm:ss"`
  * User table operation data must also have `#time` set, but user attribute operations are processed by the TE backend in the order they are received.
      * **Example:** If user table operation data from a past date is re-sent, attribute overwrite or initialization operations will proceed normally regardless of the `#time` value sent.

#### 4.4 Trigger Location (`#ip`)

`#ip` is an optional field representing the device's IP address.

  * The TE backend calculates the user's geographical location based on the IP address.
  * If geographical attributes like `#country`, `#province`, or `#city` are set in `properties`, those entered values will be prioritized.

#### 4.5 Data Unique ID (`#uuid`)

`#uuid` is an optional field representing the uniqueness of the data.

  * **Format:** Must follow the UUID standard format.
  * The TE backend detects data with the same `#uuid` received within a specific timeframe to delete duplicate data.
  * This feature prevents short-term duplicate data caused by network delays or similar issues.
  * Duplicate data will **not be stored** in the database.

**Limitation:**

  * `#uuid`-based checking only applies to data received within the last few hours and cannot determine duplication compared to the entire dataset. If comprehensive data deduplication is required, contact ThinkingData support.

-----

### 5\. Data Details (`properties` field)

The other part of the data consists of fields contained within `properties`.

  * `properties` is a JSON object, representing data in key-value pairs.
  * **User behavior data:** Represents attributes and metrics of that behavior (corresponding to fields in the behavior table).
  * **User attribute operation data:** Represents the attribute values to be set.

These fields are configured to be directly usable as attribute values or metrics for analysis.

#### 5.1 Attribute Key and Value Setting Rules

1.  **`key` Value:**

      * The `key` is the name of the attribute and must be a **string type**.
      * User-defined attributes **must start with an alphabet** and follow these rules:
          * Can only contain **alphabets** (case-insensitive), **numbers**, and **underscores (`_`)**.
          * Maximum length: **50 characters**.
      * Attributes starting with `#`:
          * These are predefined attributes by TE. Refer to the predefined attributes section for more details.
          * However, in most cases, it's recommended to use user-defined attributes and avoid attributes starting with `#`.

2.  **`value` Value:**

      * The `value` is the value of the attribute and supports various data types.
      * Descriptions of each data type are as follows:

| JSON Data Type | TE Data Type | Example                                                  | Notes                                                                                                                                                                                                            |
| :------------- | :----------- | :------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Number         | Number       | `123`, `1.23`                                            | Data range is -9E15 to 9E15.                                                                                                                                                                                   |
| String         | Text         | `"ABC"`, `"Shanghai"`                                    | Default character limit is 2KB.                                                                                                                                                                                  |
| String         | Time         | `"2019-01-01 00:00:00"`, `"2019-01-01 00:00:00.000"`     | Use `"yyyy-MM-dd HH:mm:ss.SSS"` or `"yyyy-MM-dd HH:mm:ss"`. To display only the date, you can use `"yyyy-MM-dd 00:00:00"`.                                                                                    |
| Boolean        | Boolean      | `true`, `false`                                          | -                                                                                                                                                                                                                |
| Array(String)  | List         | `["a","1","true"]`                                       | All elements in the list are converted to string type. Maximum 500 elements in a list.                                                                                                                           |
| Object         | Object       | `{hero_name: "Liu Bei", hero_level: 22, hero_equipment: ["Male and Female Double Sword", "Lu"], hero_if_support: False}` | Each child attribute (key) within an object has its own data type. For value selection, refer to the general attribute types above. Maximum 100 child attributes within an object.                               |
| Array(Object)  | Object group | `[{hero_name: "Liu Bei", hero_level: 22, hero_equipment: ["Male and Female Double Sword", "Lu"], hero_if_support: False}, {hero_name: "Liu Bei", hero_level: 22, hero_equipment: ["Male and Female Double Sword", "Lu"], hero_if_support: False}]` | Each child attribute (key) within an object group has its own data type. For value selection, refer to the general attribute types above. Maximum 500 objects within an object group. |

#### 5.2 Attribute Type Rules

  * **Attribute Type Determination:**
      * The data type of an attribute is fixed to the type of the first received value.
      * If a different type of data is subsequently sent for the same attribute, that attribute will be ignored.
  * **Type Mismatch Data Handling:**
      * Attributes with mismatched types are deleted, while the remaining attributes of that data are processed normally.
      * TE does **not** automatically perform type compatible conversions.

**Caution:** Before sending data, ensure attribute types are consistent. It's recommended to implement logic to validate value types in advance to prevent data input errors.

-----

### 6\. Data Processing Rules

After receiving data, the TE server performs various processing tasks. This document describes the TE backend's processing rules based on actual usage scenarios.

#### 6.1 Receiving New Event Data

  * When new event data is received, the TE backend automatically creates an association model between the event and its attributes.
  * When a new attribute is received, its data type is set to the type of the first received value. This attribute's type cannot be modified later.

#### 6.2 Adding Attributes to Existing Events

  * To add new attributes to an existing event, simply include the desired attributes when uploading the data.
  * The TE backend dynamically associates the added attributes with the event; no separate configuration is required.

#### 6.3 Handling Attribute Type Mismatch

  * If an attribute's type in the received event data conflicts with its existing type stored in the backend, the value of that attribute will be **discarded** (treated as `null`).

#### 6.4 Disabling Event Attributes

  * To stop using a specific attribute, you can hide it in the TE backend's data management.
  * You can then omit this attribute when sending data in the future.
  * **Important:** The TE backend does not delete data for hidden attributes, and hiding can be reversed.
  * Even after hiding, if you send data containing that attribute, the value will still be stored.

#### 6.5 Common Attributes Across Multiple Events

  * If different events have attributes with the same name, they are considered the same attribute, and their types must also match.
  * If attribute types with the same name do not match, the attribute value will be discarded.

#### 6.6 User Table Manipulation Logic

Data that modifies user table data (where the `#type` field is `user_set`, `user_setOnce`, `user_add`, `user_unset`, `user_append`, `user_del`, or `user_uniq_append`) is considered a command.

  * This data performs operations to modify attributes in the user table for the corresponding user.
  * The type of operation is determined by the `#type` field, and the modifications are based on the attributes set in the `properties` field.

##### 6.6.1 User Attribute Overwrite (`user_set`)

  * Determines the target user based on the user ID.
  * Overwrites existing values based on the attributes in `properties`. If an attribute does not exist, a new one is created.

##### 6.6.2 User Attribute Initialization (`user_setOnce`)

  * Determines the target user based on the user ID.
  * Initializes attributes in `properties` that do not have existing values.
  * If an attribute already has a value, it is not overwritten.
  * If an attribute does not exist, a new one is created.

##### 6.6.3 User Attribute Accumulation (`user_add`)

  * Determines the target user based on the user ID.
  * Accumulates values for numeric attributes in `properties`.
  * Sending a negative number will subtract that value from the existing value.
  * If an attribute has no value, its default value is set to `0` before accumulation.
  * If an attribute does not exist, a new one is created.

##### 6.6.4 User Attribute Value Reset (`user_unset`)

  * Determines the target user based on the user ID.
  * Resets (sets to NULL) the attributes in `properties`.
  * If an attribute does not exist, it is not newly created.

##### 6.6.5 Adding Elements to List Attributes (`user_append`)

  * Determines the target user based on the user ID.
  * Adds elements to list-type attributes in `properties`.

##### 6.6.6 Deleting Users (`user_del`)

  * Determines the target user based on the user ID.
  * Deletes the user from the user table.
  * Event data for the deleted user is **not** deleted.

##### 6.6.7 Adding Elements to List Attributes and Removing Duplicates (`user_uniq_append`)

  * Determines the target user based on the user ID.
  * Adds elements to list-type attributes in `properties`, then removes duplicates from the entire list.
  * Duplicate removal preserves existing element order.

-----

### 7\. Data Limitations

The TE backend has default limits on the number of event types and attributes per project to ensure performance.

#### 7.1 Event and Attribute Count Limits

| Limitation     | Events | Event Attributes | User Attributes |
| :------------- | :----- | :--------------- | :-------------- |
| Recommended Max | 100    | 300              | 100             |
| Hardware Max   | 500    | 1000             | 500             |

  * Administrators can check the current number of event types and attributes in use for each project on the "Project Management" page.
  * If you need to increase these limits, contact TE support.

#### 7.2 `#account_id` and `#distinct_id` Length Limits

  * **Projects created before version 3.1:** Maximum 64 characters. (Contact TE support if 128 characters are needed.)
  * **Projects created after version 3.1:** Maximum 128 characters.

#### 7.3 Event and Attribute Name Limits

1.  **Event Name:**

      * `String` type.
      * Must start with an alphabet, and can only contain numbers, uppercase/lowercase alphabets, and underscores (`_`).
      * Maximum 50 characters.

2.  **Attribute Name:**

      * `String` type.
      * Must start with an alphabet, and can only contain numbers, alphabets (case-insensitive), and underscores (`_`).
      * Maximum 50 characters.
      * Names starting with `#` are only allowed for predefined attributes by TE.

#### 7.4 Attribute Data Type Specific Range Limits

1.  **Text (String):** Maximum 2KB.
2.  **Number (Number):** Value range is -9E15 to 9E15.
3.  **List (Array(String)):**
      * Maximum 500 elements.
      * Each element is a string type, maximum 255 bytes.
4.  **Object (Object):** Maximum 100 child attributes.
5.  **Object Group (Array(Object)):** Maximum 500 objects.

#### 7.5 Data Reception Limits

1.  **Server Reception Limit:** Only data from 3 years prior to 3 days after the server's current time can be received.
2.  **Client Reception Limit:** Only data from 10 days prior to 3 days after the server's current time can be received.

-----

### 8\. Other Rules

1.  **Data must be UTF-8 encoded.** This prevents character corruption due to encoding errors.
2.  **Attribute names are case-insensitive.** It's recommended to use underscores (`_`) as separators.
3.  **By default, the TE backend only receives data from the last 3 years.** To input data older than 3 years, contact TE support to extend the reception period.

-----

### 9\. Frequently Encountered Problems

This section summarizes common issues that may arise from not adhering to the data rules. If you encounter data transmission problems, review the following points.

#### 9.1 Data Not Received by TE Backend

##### If using SDK:

1.  Verify that the SDK is integrated correctly.
2.  Check if the **APPID** and **transmission URL** are correctly configured.
      * Ensure the transmission port number and transmission method suffix are not missing.

##### If using LogBus or POST method:

1.  Check if the **APPID** and **transmission URL** are correctly configured.
      * Ensure the transmission port number and transmission method suffix are not missing.
2.  Confirm that the data is sent in **JSON format**.
      * JSON data must be written **one per line**.
3.  Verify that the `key` values in the data information section start with `#` and that **required fields are not missing**.
4.  Check if the data type and format (e.g., time format) of the `value` in the data information section are correct.
5.  Confirm that the value of `"#event_name"` adheres to the rules.
      * It should not contain Chinese characters, spaces, or other invalid characters.
6.  Ensure that `"properties"` does **not** start with `#`.

**Important Notes:**

  * User attribute settings (`user_set`, etc.) do **not** generate behavior records. Therefore, this data may not be immediately visible in backend behavior analysis models (except for SQL queries).
  * If the uploaded data is too old (over 3 years), it will not be saved.
  * If you uploaded historical data, ensure your query period includes that data and adjust the query period if necessary.

#### 9.2 Some Data is Missing or Specific Attributes are Not Received

1.  Check if the attribute `key` values in the data body section adhere to the rules.
      * They should not contain Chinese characters, spaces, or other invalid characters.
2.  Confirm whether any `key` values in the data body section starting with `#` are predefined attributes by TE.
3.  When missing attributes are uploaded, check if their attribute type matches the type stored for that attribute in the backend.
      * You can view the stored attribute types in the backend's metadata management.

#### 9.3 Data Needs to Be Deleted Due to Transmission Errors

1.  **Private server deployment users:** Can use the data deletion tool to delete data directly.
2.  **SaaS service users:** Can contact TE support to delete data.
3.  If there are significant changes to the data, it's recommended to **create a new project**.
      * Always thoroughly validate data in a test project before formal data transmission.