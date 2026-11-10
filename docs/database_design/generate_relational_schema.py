import pymupdf
import os

def create_relational_schema_svg():
    # Width and height of canvas
    W, H = 2900, 3350
    
    svg = []
    svg.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">')
    svg.append('<defs>')
    svg.append('''
        <style>
            .header-title { font-family: "Segoe UI", Arial, sans-serif; font-size: 38px; font-weight: bold; fill: #1e3a8a; }
            .header-subtitle { font-family: "Segoe UI", Arial, sans-serif; font-size: 26px; font-weight: 600; fill: #ea580c; }
            .header-meta { font-family: "Segoe UI", Arial, sans-serif; font-size: 18px; fill: #475569; }
            .table-title { font-family: "Segoe UI", Arial, sans-serif; font-size: 22px; font-weight: bold; fill: #0f172a; }
            .cell-text { font-family: "Segoe UI", Arial, sans-serif; font-size: 16px; font-weight: 500; fill: #1e293b; text-anchor: middle; dominant-baseline: middle; }
            .cell-pk { font-family: "Segoe UI", Arial, sans-serif; font-size: 16px; font-weight: bold; fill: #0f172a; text-anchor: middle; dominant-baseline: middle; text-decoration: underline; }
            .cell-fk { font-family: "Segoe UI", Arial, sans-serif; font-size: 16px; font-weight: 600; fill: #0369a1; text-anchor: middle; dominant-baseline: middle; }
            .legend-title { font-family: "Segoe UI", Arial, sans-serif; font-size: 19px; font-weight: bold; fill: #1e293b; }
            .legend-text { font-family: "Segoe UI", Arial, sans-serif; font-size: 15px; fill: #334155; dominant-baseline: middle; }
        </style>
        <marker id="fk-arrow" viewBox="0 0 10 10" refX="5" refY="0" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M 0 10 L 5 0 L 10 10 z" fill="#0f172a" />
        </marker>
    ''')
    svg.append('</defs>')

    # Background
    svg.append(f'<rect width="{W}" height="{H}" fill="#ffffff"/>')

    # Top Header Banner matching Slide 3
    svg.append('<rect x="0" y="0" width="{}" height="100" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>'.format(W))
    svg.append('<line x1="0" y1="100" x2="{}" y2="100" stroke="#ea580c" stroke-width="5"/>'.format(W))
    svg.append('<text x="60" y="48" class="header-title">Database Management Systems</text>')
    svg.append('<text x="60" y="82" class="header-subtitle">Result of mapping Cybersecurity Incident Correlation &amp; Response ER schema into a relational database schema</text>')
    svg.append('<text x="{}" y="65" class="header-meta" text-anchor="end">Academic Course: DBMS Experiential Learning (Level 3) | Target RDBMS: PostgreSQL + pgvector</text>'.format(W - 60))

    CELL_H = 38
    TABLE_X = 220
    
    # Tables specification
    tables = [
        {
            "name": "ROLES",
            "x": TABLE_X, "y": 180,
            "cols": [
                ("role_id", True, False, 110),
                ("role_name", False, False, 160)
            ]
        },
        {
            "name": "USERS",
            "x": TABLE_X, "y": 320,
            "cols": [
                ("user_id", True, False, 110),
                ("role_id", False, True, 110),
                ("full_name", False, False, 160),
                ("email", False, False, 190),
                ("password_hash", False, False, 170),
                ("is_active", False, False, 110),
                ("created_at", False, False, 140)
            ]
        },
        {
            "name": "ASSETS",
            "x": TABLE_X, "y": 470,
            "cols": [
                ("asset_id", True, False, 110),
                ("asset_name", False, False, 150),
                ("asset_type", False, False, 130),
                ("criticality", False, False, 120),
                ("ip_address", False, False, 140),
                ("department", False, False, 140),
                ("is_active", False, False, 100),
                ("created_at", False, False, 130)
            ]
        },
        {
            "name": "INCIDENT_TYPES",
            "x": TABLE_X, "y": 620,
            "cols": [
                ("incident_type_id", True, False, 160),
                ("type_name", False, False, 160),
                ("description", False, False, 220)
            ]
        },
        {
            "name": "INCIDENTS",
            "x": TABLE_X, "y": 770,
            "cols": [
                ("incident_id", True, False, 120),
                ("incident_type_id", False, True, 160),
                ("reported_by", False, True, 130),
                ("assigned_to", False, True, 130),
                ("asset_id", False, True, 110),
                ("title", False, False, 170),
                ("description", False, False, 180),
                ("severity", False, False, 110),
                ("status", False, False, 110),
                ("priority", False, False, 100),
                ("risk_score", False, False, 110),
                ("reported_at", False, False, 130),
                ("updated_at", False, False, 130),
                ("resolved_at", False, False, 130)
            ]
        },
        {
            "name": "INVESTIGATIONS",
            "x": TABLE_X, "y": 1040,
            "cols": [
                ("investigation_id", True, False, 160),
                ("incident_id", False, True, 130),
                ("analyst_id", False, True, 120),
                ("findings", False, False, 220),
                ("started_at", False, False, 140),
                ("completed_at", False, False, 140)
            ]
        },
        {
            "name": "RESPONSE_ACTIONS",
            "x": TABLE_X, "y": 1300,
            "cols": [
                ("response_id", True, False, 140),
                ("incident_id", False, True, 130),
                ("performed_by", False, True, 140),
                ("action_type", False, False, 150),
                ("description", False, False, 220),
                ("action_status", False, False, 130),
                ("performed_at", False, False, 140)
            ]
        },
        {
            "name": "INCIDENT_STATUS_HISTORY",
            "x": TABLE_X, "y": 1560,
            "cols": [
                ("history_id", True, False, 120),
                ("incident_id", False, True, 130),
                ("old_status", False, False, 120),
                ("new_status", False, False, 120),
                ("changed_by", False, True, 130),
                ("changed_at", False, False, 140),
                ("remarks", False, False, 200)
            ]
        },
        {
            "name": "RISK_ASSESSMENTS",
            "x": TABLE_X, "y": 1820,
            "cols": [
                ("risk_id", True, False, 110),
                ("incident_id", False, True, 130),
                ("severity_score", False, False, 140),
                ("asset_score", False, False, 120),
                ("impact_score", False, False, 130),
                ("risk_score", False, False, 120),
                ("risk_level", False, False, 110),
                ("calculated_by", False, True, 140),
                ("calculated_at", False, False, 140)
            ]
        },
        {
            "name": "AUDIT_LOGS",
            "x": TABLE_X, "y": 2080,
            "cols": [
                ("audit_id", True, False, 110),
                ("user_id", False, True, 110),
                ("incident_id", False, True, 130),
                ("action", False, False, 150),
                ("description", False, False, 250),
                ("created_at", False, False, 140)
            ]
        },
        {
            "name": "INCIDENT_EMBEDDINGS",
            "x": TABLE_X, "y": 2340,
            "cols": [
                ("embedding_id", True, False, 150),
                ("incident_id", False, True, 130),
                ("embedding (vector_384)", False, False, 220),
                ("model_name", False, False, 180),
                ("created_at", False, False, 140)
            ]
        }
    ]

    col_coords = {}

    for t in tables:
        tx = t["x"]
        ty = t["y"]
        svg.append(f'<text x="{tx}" y="{ty-12}" class="table-title">{t["name"]}</text>')
        
        curr_x = tx
        for col_name, is_pk, is_fk, col_w in t["cols"]:
            fill_color = "#f8fafc"
            stroke_color = "#1e293b"
            svg.append(f'<rect x="{curr_x}" y="{ty}" width="{col_w}" height="{CELL_H}" fill="{fill_color}" stroke="{stroke_color}" stroke-width="1.8"/>')
            
            mid_x = curr_x + col_w / 2
            mid_y = ty + CELL_H / 2
            
            col_coords[(t["name"], col_name)] = {
                "cx": mid_x,
                "top": ty,
                "bottom": ty + CELL_H,
                "left": curr_x,
                "right": curr_x + col_w
            }
            
            if is_pk:
                svg.append(f'<text x="{mid_x}" y="{mid_y}" class="cell-pk">{col_name}</text>')
            elif is_fk:
                svg.append(f'<text x="{mid_x}" y="{mid_y}" class="cell-fk">{col_name}</text>')
            else:
                svg.append(f'<text x="{mid_x}" y="{mid_y}" class="cell-text">{col_name}</text>')
                
            curr_x += col_w

    def draw_fk_arrow(from_table, from_col, to_table, to_col, drop_offset=20, target_x_offset=0, channel_x=None):
        src = col_coords[(from_table, from_col)]
        tgt = col_coords[(to_table, to_col)]
        
        sx = src["cx"]
        sy = src["bottom"]
        tx = tgt["cx"] + target_x_offset
        ty = tgt["bottom"]
        
        if sy > ty:
            drop_y = sy + drop_offset
            if channel_x is None:
                path_d = f"M {sx} {sy} L {sx} {drop_y} L {tx} {drop_y} L {tx} {ty}"
            else:
                path_d = f"M {sx} {sy} L {sx} {drop_y} L {channel_x} {drop_y} L {channel_x} {ty+18} L {tx} {ty+18} L {tx} {ty}"
        else:
            drop_y = sy + drop_offset
            path_d = f"M {sx} {sy} L {sx} {drop_y} L {tx} {drop_y} L {tx} {tgt['top']}"
            
        svg.append(f'<path d="{path_d}" fill="none" stroke="#0f172a" stroke-width="1.8" marker-end="url(#fk-arrow)"/>')

    # Foreign Key Directed Arrows
    # 1. USERS.role_id -> ROLES.role_id
    draw_fk_arrow("USERS", "role_id", "ROLES", "role_id", drop_offset=18, target_x_offset=15)

    # 2. INCIDENTS.incident_type_id -> INCIDENT_TYPES.incident_type_id
    draw_fk_arrow("INCIDENTS", "incident_type_id", "INCIDENT_TYPES", "incident_type_id", drop_offset=20, target_x_offset=15)

    # 3. INCIDENTS.reported_by -> USERS.user_id (Channel 190)
    draw_fk_arrow("INCIDENTS", "reported_by", "USERS", "user_id", drop_offset=38, target_x_offset=-25, channel_x=190)

    # 4. INCIDENTS.assigned_to -> USERS.user_id (Channel 170)
    draw_fk_arrow("INCIDENTS", "assigned_to", "USERS", "user_id", drop_offset=56, target_x_offset=-10, channel_x=170)

    # 5. INCIDENTS.asset_id -> ASSETS.asset_id (Channel 150)
    draw_fk_arrow("INCIDENTS", "asset_id", "ASSETS", "asset_id", drop_offset=74, target_x_offset=15, channel_x=150)

    # 6. INVESTIGATIONS.incident_id -> INCIDENTS.incident_id
    draw_fk_arrow("INVESTIGATIONS", "incident_id", "INCIDENTS", "incident_id", drop_offset=20, target_x_offset=-25)

    # 7. INVESTIGATIONS.analyst_id -> USERS.user_id (Channel 130)
    draw_fk_arrow("INVESTIGATIONS", "analyst_id", "USERS", "user_id", drop_offset=38, target_x_offset=5, channel_x=130)

    # 8. RESPONSE_ACTIONS.incident_id -> INCIDENTS.incident_id
    draw_fk_arrow("RESPONSE_ACTIONS", "incident_id", "INCIDENTS", "incident_id", drop_offset=20, target_x_offset=-10)

    # 9. RESPONSE_ACTIONS.performed_by -> USERS.user_id (Channel 110)
    draw_fk_arrow("RESPONSE_ACTIONS", "performed_by", "USERS", "user_id", drop_offset=38, target_x_offset=20, channel_x=110)

    # 10. INCIDENT_STATUS_HISTORY.incident_id -> INCIDENTS.incident_id
    draw_fk_arrow("INCIDENT_STATUS_HISTORY", "incident_id", "INCIDENTS", "incident_id", drop_offset=20, target_x_offset=5)

    # 11. INCIDENT_STATUS_HISTORY.changed_by -> USERS.user_id (Channel 90)
    draw_fk_arrow("INCIDENT_STATUS_HISTORY", "changed_by", "USERS", "user_id", drop_offset=38, target_x_offset=32, channel_x=90)

    # 12. RISK_ASSESSMENTS.incident_id -> INCIDENTS.incident_id
    draw_fk_arrow("RISK_ASSESSMENTS", "incident_id", "INCIDENTS", "incident_id", drop_offset=20, target_x_offset=20)

    # 13. RISK_ASSESSMENTS.calculated_by -> USERS.user_id (Channel 70)
    draw_fk_arrow("RISK_ASSESSMENTS", "calculated_by", "USERS", "user_id", drop_offset=38, target_x_offset=44, channel_x=70)

    # 14. AUDIT_LOGS.user_id -> USERS.user_id (Channel 50)
    draw_fk_arrow("AUDIT_LOGS", "user_id", "USERS", "user_id", drop_offset=20, target_x_offset=-38, channel_x=50)

    # 15. AUDIT_LOGS.incident_id -> INCIDENTS.incident_id
    draw_fk_arrow("AUDIT_LOGS", "incident_id", "INCIDENTS", "incident_id", drop_offset=38, target_x_offset=35)

    # 16. INCIDENT_EMBEDDINGS.incident_id -> INCIDENTS.incident_id
    draw_fk_arrow("INCIDENT_EMBEDDINGS", "incident_id", "INCIDENTS", "incident_id", drop_offset=20, target_x_offset=-40)

    # Textbook Legend & Explanation (Matching Slide 3)
    lx, ly = TABLE_X, 2580
    svg.append(f'<rect x="{lx}" y="{ly}" width="{W - TABLE_X - 120}" height="300" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.8" rx="6"/>')
    svg.append(f'<text x="{lx+30}" y="{ly+40}" class="legend-title">Academic Relational Schema Notation &amp; Referential Integrity Reference (Elmasri &amp; Navathe Chapter 9)</text>')

    # Column notation guide
    svg.append(f'<rect x="{lx+40}" y="{ly+70}" width="160" height="34" fill="#f8fafc" stroke="#1e293b" stroke-width="1.8"/>')
    svg.append(f'<text x="{lx+120}" y="{ly+87}" class="cell-pk">Primary_Key</text>')
    svg.append(f'<text x="{lx+220}" y="{ly+87}" class="legend-text"><b>Primary Key (Solidly Underlined):</b> Uniquely identifies entity tuples; cannot be NULL (Entity Integrity Constraint).</text>')

    svg.append(f'<rect x="{lx+40}" y="{ly+120}" width="160" height="34" fill="#f8fafc" stroke="#1e293b" stroke-width="1.8"/>')
    svg.append(f'<text x="{lx+120}" y="{ly+137}" class="cell-fk">Foreign_Key</text>')
    svg.append(f'<text x="{lx+220}" y="{ly+137}" class="legend-text"><b>Foreign Key (Referencing Field):</b> Must match candidate key value in referenced relation or be NULL (Referential Integrity).</text>')

    svg.append(f'<path d="M {lx+50} {ly+185} L {lx+150} {ly+185} L {lx+150} {ly+170}" fill="none" stroke="#0f172a" stroke-width="2" marker-end="url(#fk-arrow)"/>')
    svg.append(f'<text x="{lx+220}" y="{ly+178}" class="legend-text"><b>Referential Integrity Directed Arrow:</b> Originates at the Foreign Key cell and points directly into the referenced Primary Key cell.</text>')

    # 3NF / BCNF Summary Box
    svg.append(f'<text x="{lx+40}" y="{ly+230}" class="legend-text" font-weight="bold">Schema Normalization Status: All 11 relations are in 3NF and BCNF.</text>')
    svg.append(f'<text x="{lx+40}" y="{ly+255}" class="legend-text">• 1NF: Atomic domain values, no repeating groups  |  • 2NF: No partial key dependencies  |  • 3NF &amp; BCNF: No transitive dependencies on candidate keys.</text>')

    svg.append('</svg>')
    return '\n'.join(svg)

# Write SVG and generate PNG
svg_str = create_relational_schema_svg()
svg_path = r'D:\DBMS Mini Project\docs\database_design\02_RELATIONAL_SCHEMA_DIAGRAM.svg'
with open(svg_path, 'w', encoding='utf-8') as f:
    f.write(svg_str)
print('Saved Relational Schema SVG to:', svg_path)

doc = pymupdf.open(stream=svg_str.encode('utf-8'), filetype='svg')
page = doc[0]
pix = page.get_pixmap(dpi=200) # High-Res 200 DPI
png_path = r'D:\DBMS Mini Project\docs\database_design\02_RELATIONAL_SCHEMA_DIAGRAM.png'
pix.save(png_path)
print(f'Saved High-Res Relational Schema PNG ({pix.width}x{pix.height}) to: {png_path}')
