-- pandoc-ud.lua
-- Proof-of-concept Pandoc <-> Universal Document (UD/iSDF v0.1.0) bridge.
-- Supports both Reader and Writer in one file on current Pandoc releases.

local UD_VERSION = "0.1.0"
local PANDOC_BLOCK_SCHEMA = "https://pandoc.org/ast/block/v1"

local function json_decode(s)
  local ok, result = pcall(pandoc.json.decode, s)
  if not ok then error("pandoc-ud: invalid UD JSON: " .. tostring(result)) end
  return result
end

local function json_encode(v)
  return pandoc.json.encode(v)
end

local function meta_string(v)
  if v == nil then return nil end
  return pandoc.MetaString(tostring(v))
end

local function stringify_inlines(inlines)
  return pandoc.utils.stringify(inlines)
end

local function plain_inlines(inlines)
  for _, el in ipairs(inlines or {}) do
    local tag = el.tag
    if tag ~= "Str" and tag ~= "Space" and tag ~= "SoftBreak" and tag ~= "LineBreak" then
      return false
    end
  end
  return true
end

local function simple_block_text(blocks)
  if not blocks or #blocks ~= 1 then return nil end
  local b = blocks[1]
  if (b.tag == "Plain" or b.tag == "Para") and plain_inlines(b.content) then
    return stringify_inlines(b.content)
  end
  return nil
end

local function body_fingerprint(blocks)
  -- Stable enough for edit detection inside the same Pandoc version.
  return pandoc.write(pandoc.Pandoc(blocks or {}, {}), "json")
end

local function source_text(sources)
  return tostring(sources)
end

local function default_manifest()
  return {
    base_language = "en",
    language_manifest = { { code = "en", label = "English", direction = "ltr" } },
    clarity_layer_manifest = {},
    permissions = {
      allow_copy = true,
      allow_print = true,
      allow_export = true,
      require_auth = false,
    },
  }
end

local function now_iso()
  -- Pandoc Lua exposes os.date in the embedded runtime.
  return os.date("!%Y-%m-%dT%H:%M:%SZ")
end

local function deterministic_id(seed)
  -- UUID-looking deterministic ID for a POC. Not intended as cryptographic identity.
  local h = pandoc.utils.sha1(seed or "pandoc-ud")
  return string.format("%s-%s-4%s-a%s-%s",
    h:sub(1,8), h:sub(9,12), h:sub(14,16), h:sub(18,20), h:sub(21,32))
end

local function block_id(i)
  return string.format("b_%04d", i)
end

local function pandoc_block_envelope(block, id, warning)
  local mini = pandoc.Pandoc({ block }, {})
  return {
    id = id,
    type = "custom",
    base_content = {
      schema = PANDOC_BLOCK_SCHEMA,
      data = {
        pandoc_json = pandoc.write(mini, "json"),
        display_text = pandoc.utils.stringify(block),
        preservation = "exact-pandoc-ast",
      },
    },
    hidden = false,
    provenance = {
      source = "pandoc AST",
      imported_from = "pandoc",
      imported_at = now_iso(),
    },
    _warning = warning,
  }
end

local function ud_block_from_pandoc(block, i, warnings)
  local id = block_id(i)

  if block.tag == "Para" or block.tag == "Plain" then
    if plain_inlines(block.content) then
      return {
        id = id,
        type = "paragraph",
        base_content = { text = stringify_inlines(block.content) },
      }
    end
    warnings[#warnings + 1] = string.format("block %d: rich inline formatting preserved as custom Pandoc AST block", i)
    return pandoc_block_envelope(block, id, warnings[#warnings])
  end

  if block.tag == "Header" then
    if plain_inlines(block.content) then
      return {
        id = id,
        type = "heading",
        base_content = { text = stringify_inlines(block.content), level = block.level },
      }
    end
    warnings[#warnings + 1] = string.format("block %d: formatted heading preserved as custom Pandoc AST block", i)
    return pandoc_block_envelope(block, id, warnings[#warnings])
  end

  if block.tag == "CodeBlock" then
    return {
      id = id,
      type = "code",
      base_content = {
        language = (block.classes and block.classes[1]) or "",
        code = block.text or "",
      },
    }
  end

  if block.tag == "HorizontalRule" then
    return { id = id, type = "divider", base_content = {} }
  end

  if block.tag == "BulletList" then
    local items = {}
    for _, item in ipairs(block.content or {}) do
      local txt = simple_block_text(item)
      if not txt then
        warnings[#warnings + 1] = string.format("block %d: nested/complex bullet list preserved as custom Pandoc AST block", i)
        return pandoc_block_envelope(block, id, warnings[#warnings])
      end
      items[#items + 1] = txt
    end
    return { id = id, type = "list", base_content = { items = items, ordered = false } }
  end

  if block.tag == "OrderedList" then
    local items = {}
    for _, item in ipairs(block.content or {}) do
      local txt = simple_block_text(item)
      if not txt then
        warnings[#warnings + 1] = string.format("block %d: nested/complex ordered list preserved as custom Pandoc AST block", i)
        return pandoc_block_envelope(block, id, warnings[#warnings])
      end
      items[#items + 1] = txt
    end
    return { id = id, type = "list", base_content = { items = items, ordered = true } }
  end

  if block.tag == "Table" then
    local headers = {}
    local rows = {}
    local ok = true

    if block.head and block.head.rows and #block.head.rows > 0 then
      local hr = block.head.rows[1]
      for _, cell in ipairs(hr.cells or {}) do
        local txt = simple_block_text(cell.contents)
        if not txt then ok = false; break end
        headers[#headers + 1] = txt
      end
    end

    if ok then
      for _, body in ipairs(block.bodies or {}) do
        if body.head and #body.head > 0 then ok = false; break end
        for _, row in ipairs(body.body or {}) do
          local outrow = {}
          for _, cell in ipairs(row.cells or {}) do
            local txt = simple_block_text(cell.contents)
            if not txt then ok = false; break end
            outrow[#outrow + 1] = txt
          end
          if not ok then break end
          rows[#rows + 1] = outrow
        end
        if not ok then break end
      end
    end

    if ok and block.foot and block.foot.rows and #block.foot.rows > 0 then ok = false end

    if ok then
      return { id = id, type = "table", base_content = { headers = headers, rows = rows } }
    end

    warnings[#warnings + 1] = string.format("block %d: complex table preserved as custom Pandoc AST block", i)
    return pandoc_block_envelope(block, id, warnings[#warnings])
  end

  if block.tag == "Figure" then
    warnings[#warnings + 1] = string.format("block %d: figure preserved as custom Pandoc AST block", i)
    return pandoc_block_envelope(block, id, warnings[#warnings])
  end

  warnings[#warnings + 1] = string.format("block %d: unsupported Pandoc block '%s' preserved as custom Pandoc AST block", i, tostring(block.tag))
  return pandoc_block_envelope(block, id, warnings[#warnings])
end

local function pandoc_block_from_custom(udb)
  local bc = udb.base_content or {}
  if bc.schema == PANDOC_BLOCK_SCHEMA and bc.data and bc.data.pandoc_json then
    local ok, mini = pcall(pandoc.read, bc.data.pandoc_json, "json")
    if ok and mini and mini.blocks and #mini.blocks > 0 then
      return mini.blocks[1]
    end
  end
  return pandoc.Div({ pandoc.Para({ pandoc.Str("Unsupported UD custom block") }) }, pandoc.Attr("", {"ud-custom-unsupported"}, {}))
end

local function markdown_table_from_ud(base)
  local headers = base.headers or {}
  local rows = base.rows or {}
  if #headers == 0 and #rows == 0 then return nil end

  local width = #headers
  if width == 0 and rows[1] then width = #rows[1] end
  if width == 0 then return nil end

  local h = {}
  for i = 1, width do h[i] = tostring(headers[i] or "") end
  local lines = {}
  lines[#lines + 1] = "| " .. table.concat(h, " | ") .. " |"
  local sep = {}
  for i = 1, width do sep[i] = "---" end
  lines[#lines + 1] = "| " .. table.concat(sep, " | ") .. " |"
  for _, row in ipairs(rows) do
    local vals = {}
    for i = 1, width do vals[i] = tostring(row[i] or "") end
    lines[#lines + 1] = "| " .. table.concat(vals, " | ") .. " |"
  end
  local doc = pandoc.read(table.concat(lines, "\n"), "markdown")
  return doc.blocks[1]
end

local function pandoc_block_from_ud(udb)
  local base = udb.base_content or {}
  local t = udb.type

  if t == "paragraph" then return pandoc.Para({ pandoc.Str(tostring(base.text or "")) }) end
  if t == "heading" then return pandoc.Header(tonumber(base.level or 2), { pandoc.Str(tostring(base.text or "")) }) end
  if t == "code" then
    local classes = {}
    if base.language and base.language ~= "" then classes[1] = tostring(base.language) end
    return pandoc.CodeBlock(tostring(base.code or ""), pandoc.Attr("", classes, {}))
  end
  if t == "divider" then return pandoc.HorizontalRule() end
  if t == "list" then
    local items = {}
    for _, item in ipairs(base.items or {}) do
      items[#items + 1] = { pandoc.Plain({ pandoc.Str(tostring(item)) }) }
    end
    if base.ordered then return pandoc.OrderedList(items) end
    return pandoc.BulletList(items)
  end
  if t == "table" then
    local tbl = markdown_table_from_ud(base)
    if tbl then return tbl end
  end
  if t == "custom" then return pandoc_block_from_custom(udb) end
  if t == "image" then
    local alt = tostring(base.alt or "")
    local src = tostring(base.src or "")
    local img = pandoc.Image({pandoc.Str(alt)}, src, "")
    if base.caption and base.caption ~= "" then
      return pandoc.Figure({ pandoc.Plain({img}) }, pandoc.Caption({}, {pandoc.Plain({pandoc.Str(tostring(base.caption))})}))
    end
    return pandoc.Para({img})
  end

  return pandoc.Div({ pandoc.Para({ pandoc.Str("Unsupported UD block: " .. tostring(t)) }) }, pandoc.Attr("", {"ud-unsupported"}, {}))
end

function Reader(sources, options)
  local raw = source_text(sources)
  local ud = json_decode(raw)
  if type(ud) ~= "table" then error("pandoc-ud: top-level value must be an object") end
  if ud.state ~= "UDR" and ud.state ~= "UDS" then error("pandoc-ud: state must be UDR or UDS") end
  if type(ud.blocks) ~= "table" then error("pandoc-ud: blocks must be an array") end

  local blocks = {}
  for _, udb in ipairs(ud.blocks) do
    if not udb.hidden then blocks[#blocks + 1] = pandoc_block_from_ud(udb) end
  end

  local meta = {}
  meta.title = meta_string(ud.metadata and ud.metadata.title or "Universal Document")
  meta.ud_state = meta_string(ud.state)
  meta.ud_version = meta_string(ud.ud_version or UD_VERSION)
  meta.ud_original_json = meta_string(raw)
  meta.ud_original_body_fingerprint = meta_string(body_fingerprint(blocks))
  meta.ud_roundtrip_policy = meta_string("return original UD JSON exactly when Pandoc body is unchanged")

  if ud.metadata then
    if ud.metadata.id then meta.ud_id = meta_string(ud.metadata.id) end
    if ud.metadata.created_by then meta.ud_created_by = meta_string(ud.metadata.created_by) end
    if ud.metadata.document_type then meta.ud_document_type = meta_string(ud.metadata.document_type) end
  end

  -- Keep UD-only semantics available to Lua filters and to a later writer.
  meta.ud_manifest_json = meta_string(json_encode(ud.manifest or {}))
  meta.ud_metadata_json = meta_string(json_encode(ud.metadata or {}))
  if ud.seal then meta.ud_seal_json = meta_string(json_encode(ud.seal)) end
  if ud.provenance then meta.ud_provenance_json = meta_string(json_encode(ud.provenance)) end

  return pandoc.Pandoc(blocks, meta)
end

local function get_meta_string(meta, key)
  local v = meta and meta[key]
  if not v then return nil end
  return pandoc.utils.stringify(v)
end

function Writer(doc, options)
  local original = get_meta_string(doc.meta, "ud_original_json")
  local original_fp = get_meta_string(doc.meta, "ud_original_body_fingerprint")
  local current_fp = body_fingerprint(doc.blocks)

  if original and original_fp and original_fp == current_fp then
    return original
  end

  local warnings = {}
  local blocks = {}
  for i, block in ipairs(doc.blocks or {}) do
    local mapped = ud_block_from_pandoc(block, i, warnings)
    -- _warning is internal only; do not leak it into iSDF block schema.
    mapped._warning = nil
    blocks[#blocks + 1] = mapped
  end

  local title = get_meta_string(doc.meta, "title") or "Pandoc document"
  local created = now_iso()
  local source_format = get_meta_string(doc.meta, "source-format") or "pandoc-ast"

  local ud = {
    ud_version = UD_VERSION,
    state = "UDR",
    metadata = {
      id = deterministic_id(title .. created .. tostring(#blocks)),
      title = title,
      created_at = created,
      updated_at = created,
      created_by = "pandoc-ud Lua bridge",
      document_type = "pandoc-import",
      tags = { "pandoc", "conversion" },
      revoked = false,
    },
    manifest = default_manifest(),
    blocks = blocks,
    provenance = {
      converter = "pandoc-ud",
      source_format = source_format,
      conversion_policy = "native UD blocks where lossless; exact Pandoc AST custom blocks otherwise",
      loss_warnings = warnings,
      warning_count = #warnings,
    },
  }

  return json_encode(ud)
end
