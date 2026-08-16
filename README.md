# Welcome to Codebug Pai Grid

Codebug Pai Grid is a virtual Power Apps Component Framework (PCF) control that renders a JSON array as a Fluent UI table. Columns are read left to right from the property order in each JSON object. `columnHeaders` provides the visible headings and `cellTypes` selects the renderer for each matching position.

![Image](Images\Lookandfeel.png)

## Configuration

| Manifest property | Type and usage | How it is used |
| --- | --- | --- |
| `crmUrl` | Required, input `SingleLine.Text` text property | Url for the crm instance where the control is hosted |
| `data` | Required, bound `Multiple` text property | JSON array used as the table data source. Each object must use a consistent property order because its values are mapped left to right. Invalid JSON or a value that is not an array results in an empty grid. |
| `columnHeaders` | Required input `SingleLine.Text` property | JSON string array of headings. Its length controls the number of visible values from each data object. Example: `["Picture", "Name", "Email"]`. |
| `cellTypes` | Required input `SingleLine.Text` property | JSON string array of cell types. Each entry applies to the value at the same index as its header. Type names are trimmed and case-insensitive. |
| `isSortable` | Optional enum input: `No` (`0`) or `Yes` (`1`) | Enables or disables header-click sorting. |
| `pageSize` | Optional `Whole.None` input, default `0` | Maximum rows per page. `0` means paging is disabled and all rows are rendered. |

The header and type arrays must align with the JSON property order. For example:

```json
{
  "picture": "https://example.com/avatar.png",
  "name": "Lakisha Huffman",
  "email": "lakisha@example.com",
  "crmObject": { "entityname": "contact", "id": "...", "name": "Lakisha Huffman" },
  "phone": "+1 (927) 453-2840",
  "product": "https://www.apple.com/iphone-16-pro/",
  "balance": "$3,588.77",
  "isActive": false,
  "tags": ["ipsum", "cillum"]
}
```

uses:

```json
["Picture", "Name", "Email", "Link", "Phone Number", "Product", "Balance", "Status", "Tags"]
```

```json
["image", "text", "email", "crmLink", "text", "link", "text", "boolean", "array"]
```
Look at the following JSON file that have been used to prepare this control
- [Bigger version](dummyData.json) 
- [Smaller version](dummyData-small.json)

## Cell Types

Internally, a grid cell is represented by:

```ts
string | number | boolean | IEmailCell | IPosition | IImage | ILinkCell | ITextArray | ICrmObject
```

`CellRenderingService` converts each raw JSON value using the configured `cellTypes` entry. Invalid values are converted to an empty value for the requested type.

| `cellTypes` value | Internal value | Defining fields | Rendering |
| --- | --- | --- | --- |
| `text` (default) | `string` | String value | Plain text. |
| `number` | `number` | Number value | Plain numeric text; numeric values sort numerically. |
| `boolean` | `boolean` | Boolean value | `true` renders as `Yes`; `false` renders as `No`. |
| `email` | `IEmailCell` | `kind: "email"`, `value` | Blue `mailto:` link using `value`. |
| `image` | `IImage` | `kind: "image"`, `url` | Avatar-style image. A `?` fallback is shown when the URL is empty or cannot load. |
| `link` | `ILinkCell` | `kind: "link"`, `url` | Blue hyperlink using `url`, opened in a new tab with `noopener noreferrer`. |
| `array` | `ITextArray` | `kind: "text-array"`, `values` | Array string values joined with `, `. |
| `location` | `IPosition` | `latitude`, `longitude` | Google Maps link shown as a map icon and opened in a new tab. |
| `crmLink` | `ICrmObject` | `entityname` or `entityName`, `id`, optional `name` | Blue Dynamics record link. The display text is `name`, or `unknown` when no name is present. |

## Cell Guards

`CellGuards.ts` contains TypeScript type guards used before rendering or converting cells. Guards ensure a cell has the expected shape before code reads its fields.

- `isEmailCell`, `isImageCell`, `isLinkCell`, and `isTextArrayCell` require a non-null object with the appropriate `kind` discriminator.
- `isPositionObject` requires exactly the `latitude` and `longitude` keys, both numbers. `isPositionCell` applies this validation to a grid cell.
- `isCrmObjectCell` rejects null values and arrays, then requires a non-empty entity name (`entityname` or `entityName`) and a non-empty `id`.

This prevents object values from reaching React as children and allows the renderer to safely select the correct display behavior.

## Sorting

When `isSortable` is `Yes`, selecting a header sorts by its column. Selecting the active header again reverses the direction. A new column begins in ascending order.

Numbers are compared numerically. All other cell values are converted to display text and compared with `localeCompare`. Sorting returns to page 1. Image, link, email, array, location, and CRM cells use their relevant text value for sorting.

## Paging

Paging is enabled only when `pageSize` is greater than `0`. The control calculates the total pages from the sorted row count, displays previous/next buttons and numbered pages, and prevents movement outside the valid range.

Set `pageSize` to `0` to disable paging and render the full sorted data set.

## Commands

Run these commands from the project root after installing dependencies with `npm install`.

| Command | Purpose |
| --- | --- |
| `npm run build` | Build the PCF control. |
| `npm run rebuild` | Clean and build the PCF control. |
| `npm run clean` | Remove generated build output. |
| `npm run lint` | Run the project lint rules. |
| `npm run lint:fix` | Run linting and apply available fixes. |
| `npm run refreshTypes` | Regenerate types from the PCF manifest. |
| `npm run start` | Start the PCF test harness. |
| `npm run start:watch` | Start the test harness in watch mode. |
