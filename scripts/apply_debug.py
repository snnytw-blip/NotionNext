import os
path = 'lib/notion/getPageProperties.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace 1: Add schema dump after GETPROP
old = "    // ★ DIAGNOSTIC: schema availability check\n    console.log('[DEBUG GETPROP]', id,\n      'propKeys:', Object.keys(value?.properties || {}),\n      'schemaKeys:', Object.keys(schema || {}),\n      'schemaNull:', schema == null,\n      'schemaKeysCount:', Object.keys(schema || {}).length\n    )\n    // ★ DEEP DIAGNOSTIC: value structure when properties are empty"

new = "    // ★ DIAGNOSTIC: schema availability check\n    console.log('[DEBUG GETPROP]', id,\n      'propKeys:', Object.keys(value?.properties || {}),\n      'schemaKeys:', Object.keys(schema || {}),\n      'schemaNull:', schema == null,\n      'schemaKeysCount:', Object.keys(schema || {}).length\n    )\n    // ★ DIAGNOSTIC: dump full schema details\n    if (schema) {\n      for (const [sk, sv] of Object.entries(schema)) {\n        console.log('[DEBUG SCHEMA ENTRY]', sk, 'name:', sv?.name, 'type:', sv?.type, 'id:', sv?.id)\n      }\n    }\n    // ★ DEEP DIAGNOSTIC: value structure when properties are empty"

content = content.replace(old, new)
print('Replace 1 done, count:', content.count('[DEBUG SCHEMA ENTRY]'))

# Replace 2: Add debug log for text and date mapping
old2 = "    if (schemaEntry?.type && !excludeProperties.includes(schemaEntry.type)) {\n      properties[schemaEntry.name] = getTextContent(val)\n    } else if (schemaEntry?.type === 'date') {\n      const dateProperty = getDateValue(val)\n      delete dateProperty.type\n      properties[schemaEntry.name] = dateProperty"

new2 = "    if (schemaEntry?.type && !excludeProperties.includes(schemaEntry.type)) {\n      properties[schemaEntry.name] = getTextContent(val)\n      console.log('[DEBUG MAP TEXT]', schemaEntry.name, 'type:', schemaEntry.type, 'valPreview:', JSON.stringify(getTextContent(val)).substring(0, 50))\n    } else if (schemaEntry?.type === 'date') {\n      const dateProperty = getDateValue(val)\n      delete dateProperty.type\n      properties[schemaEntry.name] = dateProperty\n      console.log('[DEBUG MAP DATE]', schemaEntry.name, 'start:', dateProperty?.start_date, 'end:', dateProperty?.end_date, 'valPreview:', JSON.stringify(val).substring(0, 80))"

content = content.replace(old2, new2)
print('Replace 2 done, count:', content.count('[DEBUG MAP DATE]'))

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print('File written successfully')