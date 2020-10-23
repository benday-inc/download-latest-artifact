![build-test](https://github.com/benday/action-edit-dbconnstr-in-appsettings/workflows/build-test/badge.svg)

# Edit a .net core connection string in appsettings.json

This action helps you to edit the connection strings in your appsettings.json file. 

## Usage

To edit a connection string inside of an appsettings.json file:  
```yaml
- name: edit connection string
  uses: benday/action-edit-dbconnstr-in-appsettings@main
  with:
    pathtosettingsfile: '${{ github.workspace }}/Benday.Demo123/src/Benday.Demo123.WebUi/appsettings.json'
    name: "default"
    connectionstring: "Server=(local); Database=demo123; Trusted_Connection=True;"
```

----
## Action Spec:

### Environment variables
- None

### Inputs
- `pathtosettingsfile` - Path to the appsettings.json file
- `name` - Name of the connection string
- `connectionstring` - Value for the connection string

### Outputs
- None
