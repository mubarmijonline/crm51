Side sheet. Use it instead of Dialog when the user needs the list behind it for context.

```jsx
<Drawer title="Edit customer" onClose={close} footer={<><Button onClick={close}>Cancel</Button><Button variant="primary">Save</Button></>}>…</Drawer>
```
