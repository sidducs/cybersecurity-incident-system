import pymupdf
import os

def create_chen_er_svg():
    # Width and height of canvas
    W, H = 3400, 2600
    
    svg = []
    svg.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">')
    svg.append('<defs>')
    svg.append('''
        <style>
            .header-title { font-family: "Segoe UI", Arial, sans-serif; font-size: 38px; font-weight: bold; fill: #1e3a8a; }
            .header-subtitle { font-family: "Segoe UI", Arial, sans-serif; font-size: 26px; font-weight: 600; fill: #ea580c; }
            .header-meta { font-family: "Segoe UI", Arial, sans-serif; font-size: 18px; fill: #475569; }
            .entity-text { font-family: "Segoe UI", Arial, sans-serif; font-size: 22px; font-weight: bold; fill: #0f172a; text-anchor: middle; dominant-baseline: middle; }
            .rel-text { font-family: "Segoe UI", Arial, sans-serif; font-size: 18px; font-weight: bold; fill: #0f172a; text-anchor: middle; dominant-baseline: middle; }
            .attr-text { font-family: "Segoe UI", Arial, sans-serif; font-size: 16px; font-weight: 500; fill: #1e293b; text-anchor: middle; dominant-baseline: middle; }
            .attr-pk { font-family: "Segoe UI", Arial, sans-serif; font-size: 16px; font-weight: bold; fill: #0f172a; text-anchor: middle; dominant-baseline: middle; text-decoration: underline; }
            .attr-partial-pk { font-family: "Segoe UI", Arial, sans-serif; font-size: 16px; font-weight: 600; fill: #0f172a; text-anchor: middle; dominant-baseline: middle; }
            .card-text { font-family: "Segoe UI", Arial, sans-serif; font-size: 20px; font-weight: bold; fill: #0f172a; text-anchor: middle; dominant-baseline: middle; }
            .constraint-text { font-family: "Segoe UI", Arial, sans-serif; font-size: 15px; font-weight: 600; fill: #475569; text-anchor: middle; dominant-baseline: middle; }
            .role-text { font-family: "Segoe UI", Arial, sans-serif; font-size: 16px; font-style: italic; font-weight: 600; fill: #b91c1c; text-anchor: middle; dominant-baseline: middle; }
            .legend-title { font-family: "Segoe UI", Arial, sans-serif; font-size: 18px; font-weight: bold; fill: #1e293b; }
            .legend-text { font-family: "Segoe UI", Arial, sans-serif; font-size: 14px; fill: #334155; dominant-baseline: middle; }
        </style>
        <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#0f172a" />
        </marker>
    ''')
    svg.append('</defs>')

    # Background
    svg.append(f'<rect width="{W}" height="{H}" fill="#ffffff"/>')

    # Top Header Banner matching the textbook slide style
    svg.append('<rect x="0" y="0" width="{}" height="100" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>'.format(W))
    svg.append('<line x1="0" y1="100" x2="{}" y2="100" stroke="#ea580c" stroke-width="5"/>'.format(W))
    svg.append('<text x="60" y="48" class="header-title">Database Management Systems</text>')
    svg.append('<text x="60" y="82" class="header-subtitle">Cybersecurity Incident Correlation &amp; Response Intelligence System — Entity-Relationship (ER) Diagram (Chen Notation)</text>')
    svg.append('<text x="{}" y="65" class="header-meta" text-anchor="end">Academic Course: DBMS Experiential Learning (Level 3) | Target RDBMS: PostgreSQL + pgvector</text>'.format(W - 60))

    # Helper Functions
    def draw_line(x1, y1, x2, y2, is_double=False, is_dashed=False):
        stroke_dash = 'stroke-dasharray="6,4"' if is_dashed else ''
        if not is_double:
            svg.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="#1e293b" stroke-width="2" {stroke_dash}/>')
        else:
            # Parallel double line for total participation
            dx = x2 - x1
            dy = y2 - y1
            length = (dx*dx + dy*dy)**0.5
            if length == 0: return
            offset = 3.5
            ox = -dy / length * offset
            oy = dx / length * offset
            svg.append(f'<line x1="{x1+ox}" y1="{y1+oy}" x2="{x2+ox}" y2="{y2+oy}" stroke="#1e293b" stroke-width="2"/>')
            svg.append(f'<line x1="{x1-ox}" y1="{y1-oy}" x2="{x2-ox}" y2="{y2-oy}" stroke="#1e293b" stroke-width="2"/>')

    def draw_entity(x, y, w, h, name, is_weak=False):
        # Center x, y
        x0, y0 = x - w/2, y - h/2
        fill_color = "#f8fafc"
        if not is_weak:
            svg.append(f'<rect x="{x0}" y="{y0}" width="{w}" height="{h}" fill="{fill_color}" stroke="#1e293b" stroke-width="2.5" rx="2"/>')
        else:
            svg.append(f'<rect x="{x0}" y="{y0}" width="{w}" height="{h}" fill="{fill_color}" stroke="#1e293b" stroke-width="2.5" rx="2"/>')
            svg.append(f'<rect x="{x0+5}" y="{y0+5}" width="{w-10}" height="{h-10}" fill="{fill_color}" stroke="#1e293b" stroke-width="2" rx="1"/>')
        svg.append(f'<text x="{x}" y="{y}" class="entity-text">{name}</text>')

    def draw_relationship(x, y, w, h, name, is_identifying=False):
        # Diamond center x, y
        points = f"{x},{y-h/2} {x+w/2},{y} {x},{y+h/2} {x-w/2},{y}"
        fill_color = "#f1f5f9"
        if not is_identifying:
            svg.append(f'<polygon points="{points}" fill="{fill_color}" stroke="#1e293b" stroke-width="2.5"/>')
        else:
            svg.append(f'<polygon points="{points}" fill="{fill_color}" stroke="#1e293b" stroke-width="2.5"/>')
            # inner diamond
            offset_w = w - 14
            offset_h = h - 10
            inner_points = f"{x},{y-offset_h/2} {x+offset_w/2},{y} {x},{y+offset_h/2} {x-offset_w/2},{y}"
            svg.append(f'<polygon points="{inner_points}" fill="{fill_color}" stroke="#1e293b" stroke-width="1.8"/>')
        
        # Multiline relationship names if needed
        parts = name.split('\n')
        if len(parts) == 1:
            svg.append(f'<text x="{x}" y="{y}" class="rel-text">{name}</text>')
        else:
            svg.append(f'<text x="{x}" y="{y-10}" class="rel-text">{parts[0]}</text>')
            svg.append(f'<text x="{x}" y="{y+12}" class="rel-text">{parts[1]}</text>')

    def draw_attribute(x, y, rx, ry, name, attr_type='normal', parent_x=None, parent_y=None):
        # attr_type: 'normal', 'pk', 'partial_pk', 'multivalued', 'derived'
        if parent_x is not None and parent_y is not None:
            draw_line(parent_x, parent_y, x, y)
        
        fill_color = "#ffffff"
        if attr_type == 'normal':
            svg.append(f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="{fill_color}" stroke="#334155" stroke-width="1.8"/>')
            svg.append(f'<text x="{x}" y="{y}" class="attr-text">{name}</text>')
        elif attr_type == 'pk':
            svg.append(f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="#f8fafc" stroke="#0f172a" stroke-width="2.2"/>')
            svg.append(f'<text x="{x}" y="{y}" class="attr-pk">{name}</text>')
        elif attr_type == 'partial_pk':
            svg.append(f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="#f8fafc" stroke="#0f172a" stroke-width="2"/>')
            # Draw dashed underline text manually
            svg.append(f'<text x="{x}" y="{y-1}" class="attr-partial-pk">{name}</text>')
            # dashed line under text
            tw = len(name) * 9.5
            svg.append(f'<line x1="{x-tw/2}" y1="{y+8}" x2="{x+tw/2}" y2="{y+8}" stroke="#0f172a" stroke-width="1.8" stroke-dasharray="3,3"/>')
        elif attr_type == 'multivalued':
            svg.append(f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="{fill_color}" stroke="#334155" stroke-width="2"/>')
            svg.append(f'<ellipse cx="{x}" cy="{y}" rx="{rx-5}" ry="{ry-4}" fill="{fill_color}" stroke="#334155" stroke-width="1.5"/>')
            svg.append(f'<text x="{x}" y="{y}" class="attr-text">{name}</text>')
        elif attr_type == 'derived':
            svg.append(f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="{fill_color}" stroke="#334155" stroke-width="2" stroke-dasharray="5,4"/>')
            svg.append(f'<text x="{x}" y="{y}" class="attr-text">{name}</text>')

    # =========================================================================
    # COORDINATES LAYOUT
    # =========================================================================
    # Central Hub: INCIDENTS at (1700, 1250)
    # Left Branch: USERS at (750, 1050), ROLES at (250, 750)
    # Top Branch: ASSETS at (1300, 520), INCIDENT_TYPES at (2100, 520)
    # Right Branch: INVESTIGATIONS at (2750, 950), RESPONSE_ACTIONS at (2750, 1550)
    # Bottom Branch: RISK_ASSESSMENTS at (1150, 1950), STATUS_HISTORY at (1700, 2050), INCIDENT_EMBEDDINGS at (2250, 1950)
    # Top Right / Log: AUDIT_LOGS at (600, 1650)
    
    # -------------------------------------------------------------------------
    # 1. ENTITY: ROLES (250, 750)
    # -------------------------------------------------------------------------
    rx, ry = 250, 750
    # Attributes for ROLES
    draw_attribute(140, 640, 65, 26, "role_id", "pk", rx, ry)
    draw_attribute(130, 750, 70, 26, "role_name", "normal", rx, ry)
    draw_entity(rx, ry, 150, 60, "ROLES")

    # -------------------------------------------------------------------------
    # RELATIONSHIP: ASSIGNED_ROLE between ROLES and USERS
    # -------------------------------------------------------------------------
    ux, uy = 750, 1000
    rel_ar_x, rel_ar_y = 480, 880
    draw_line(rx, ry, rel_ar_x, rel_ar_y, is_double=False)
    draw_line(ux, uy, rel_ar_x, rel_ar_y, is_double=True) # Total participation: every user must have a role
    draw_relationship(rel_ar_x, rel_ar_y, 170, 75, "ASSIGNED_ROLE")
    svg.append(f'<text x="{rel_ar_x-50}" y="{rel_ar_y-40}" class="card-text">1</text>')
    svg.append(f'<text x="{rel_ar_x-30}" y="{rel_ar_y-20}" class="constraint-text">(1, N)</text>')
    svg.append(f'<text x="{rel_ar_x+45}" y="{rel_ar_y+40}" class="card-text">N</text>')
    svg.append(f'<text x="{rel_ar_x+65}" y="{rel_ar_y+58}" class="constraint-text">(1, 1)</text>')

    # -------------------------------------------------------------------------
    # 2. ENTITY: USERS (750, 1000)
    # -------------------------------------------------------------------------
    # Attributes for USERS
    draw_attribute(610, 860, 65, 26, "user_id", "pk", ux, uy)
    
    # Composite attribute Name -> First_name, Last_name (like Figure 3.2!)
    comp_nx, comp_ny = 500, 960
    draw_attribute(comp_nx, comp_ny, 60, 25, "Name", "normal", ux, uy)
    draw_attribute(360, 920, 65, 24, "First_name", "normal", comp_nx, comp_ny)
    draw_attribute(360, 980, 65, 24, "Last_name", "normal", comp_nx, comp_ny)
    
    draw_attribute(490, 1060, 65, 25, "Email", "normal", ux, uy)
    draw_attribute(520, 1140, 75, 25, "Password_hash", "normal", ux, uy)
    draw_attribute(600, 1210, 65, 25, "Is_active", "normal", ux, uy)
    draw_attribute(710, 1240, 65, 25, "Created_at", "normal", ux, uy)
    
    # Multivalued attribute Phone_numbers (double oval, like Locations in Figure 3.2!)
    draw_attribute(830, 1220, 80, 26, "Phone_numbers", "multivalued", ux, uy)

    # Recursive Relationship: SUPERVISION on USERS (like Figure 3.2!)
    sup_x, sup_y = 650, 750
    # Line 1: Supervisor (1)
    svg.append(f'<path d="M {ux-40} {uy-30} Q {ux-120} {uy-180} {sup_x} {sup_y}" fill="none" stroke="#1e293b" stroke-width="2"/>')
    # Line 2: Supervisee (N)
    svg.append(f'<path d="M {ux+20} {uy-30} Q {ux+80} {uy-160} {sup_x} {sup_y}" fill="none" stroke="#1e293b" stroke-width="2"/>')
    draw_relationship(sup_x, sup_y, 160, 70, "SUPERVISION")
    svg.append(f'<text x="{sup_x-90}" y="{sup_y+5}" class="role-text">Supervisor</text>')
    svg.append(f'<text x="{sup_x-45}" y="{sup_y+35}" class="card-text">1</text>')
    svg.append(f'<text x="{sup_x+80}" y="{sup_y+5}" class="role-text">Supervisee</text>')
    svg.append(f'<text x="{sup_x+45}" y="{sup_y+35}" class="card-text">N</text>')

    draw_entity(ux, uy, 170, 65, "USERS")

    # -------------------------------------------------------------------------
    # 3. ENTITY: ASSETS (1300, 500)
    # -------------------------------------------------------------------------
    ax, ay = 1300, 500
    draw_attribute(1150, 390, 65, 26, "asset_id", "pk", ax, ay)
    draw_attribute(1280, 380, 70, 26, "Asset_name", "normal", ax, ay)
    draw_attribute(1410, 390, 65, 26, "Asset_type", "normal", ax, ay)
    draw_attribute(1480, 460, 65, 26, "Criticality", "normal", ax, ay)
    draw_attribute(1470, 540, 65, 26, "Department", "normal", ax, ay)
    draw_attribute(1410, 610, 65, 26, "Is_active", "normal", ax, ay)
    
    # Multivalued attribute IP_addresses (double oval)
    draw_attribute(1140, 600, 75, 26, "IP_addresses", "multivalued", ax, ay)
    
    # Composite attribute Location -> Data_center, Rack_no
    comp_lx, comp_ly = 1110, 490
    draw_attribute(comp_lx, comp_ly, 65, 25, "Location", "normal", ax, ay)
    draw_attribute(970, 460, 65, 24, "Data_center", "normal", comp_lx, comp_ly)
    draw_attribute(970, 520, 60, 24, "Rack_no", "normal", comp_lx, comp_ly)

    draw_entity(ax, ay, 170, 65, "ASSETS")

    # -------------------------------------------------------------------------
    # 4. ENTITY: INCIDENT_TYPES (2100, 500)
    # -------------------------------------------------------------------------
    itx, ity = 2100, 500
    draw_attribute(1940, 410, 85, 26, "incident_type_id", "pk", itx, ity)
    draw_attribute(2100, 390, 70, 26, "Type_name", "normal", itx, ity)
    draw_attribute(2240, 430, 70, 26, "Description", "normal", itx, ity)
    draw_entity(itx, ity, 190, 65, "INCIDENT_TYPES")

    # -------------------------------------------------------------------------
    # 5. CENTRAL ENTITY: INCIDENTS (1700, 1250)
    # -------------------------------------------------------------------------
    ix, iy = 1700, 1250

    # Attributes for INCIDENTS
    draw_attribute(1480, 1150, 70, 26, "incident_id", "pk", ix, iy)
    draw_attribute(1460, 1220, 55, 25, "Title", "normal", ix, iy)
    draw_attribute(1460, 1290, 65, 25, "Description", "normal", ix, iy)
    draw_attribute(1490, 1360, 60, 25, "Severity", "normal", ix, iy)
    draw_attribute(1540, 1420, 55, 25, "Status", "normal", ix, iy)
    draw_attribute(1620, 1460, 55, 25, "Priority", "normal", ix, iy)
    draw_attribute(1700, 1475, 65, 25, "Reported_at", "normal", ix, iy)
    draw_attribute(1780, 1460, 65, 25, "Updated_at", "normal", ix, iy)
    draw_attribute(1860, 1420, 65, 25, "Resolved_at", "normal", ix, iy)
    
    # Derived attribute: Risk_score (dashed oval, like Number_of_employees in Figure 3.2!)
    draw_attribute(1910, 1340, 65, 25, "Risk_score", "derived", ix, iy)
    # Derived attribute: Turnaround_time (dashed oval)
    draw_attribute(1920, 1250, 75, 25, "Turnaround_time", "derived", ix, iy)

    # -------------------------------------------------------------------------
    # RELATIONSHIP: AFFECTS between ASSETS and INCIDENTS
    # -------------------------------------------------------------------------
    rel_aff_x, rel_aff_y = 1500, 875
    draw_line(ax, ay, rel_aff_x, rel_aff_y, is_double=False)
    draw_line(ix, iy, rel_aff_x, rel_aff_y, is_double=True) # Total participation: every incident affects an asset
    draw_relationship(rel_aff_x, rel_aff_y, 150, 70, "AFFECTS")
    svg.append(f'<text x="{rel_aff_x-45}" y="{rel_aff_y-45}" class="card-text">1</text>')
    svg.append(f'<text x="{rel_aff_x-65}" y="{rel_aff_y-25}" class="constraint-text">(0, N)</text>')
    svg.append(f'<text x="{rel_aff_x+35}" y="{rel_aff_y+55}" class="card-text">N</text>')
    svg.append(f'<text x="{rel_aff_x+55}" y="{rel_aff_y+75}" class="constraint-text">(1, 1)</text>')

    # -------------------------------------------------------------------------
    # RELATIONSHIP: CLASSIFIES between INCIDENT_TYPES and INCIDENTS
    # -------------------------------------------------------------------------
    rel_cla_x, rel_cla_y = 1900, 875
    draw_line(itx, ity, rel_cla_x, rel_cla_y, is_double=False)
    draw_line(ix, iy, rel_cla_x, rel_cla_y, is_double=True) # Total participation: every incident has a classification
    draw_relationship(rel_cla_x, rel_cla_y, 160, 70, "CLASSIFIES")
    svg.append(f'<text x="{rel_cla_x+45}" y="{rel_cla_y-45}" class="card-text">1</text>')
    svg.append(f'<text x="{rel_cla_x+65}" y="{rel_cla_y-25}" class="constraint-text">(0, N)</text>')
    svg.append(f'<text x="{rel_cla_x-35}" y="{rel_cla_y+55}" class="card-text">N</text>')
    svg.append(f'<text x="{rel_cla_x-55}" y="{rel_cla_y+75}" class="constraint-text">(1, 1)</text>')

    # -------------------------------------------------------------------------
    # RELATIONSHIP: REPORTS between USERS and INCIDENTS (Role: Reporter)
    # -------------------------------------------------------------------------
    rel_rep_x, rel_rep_y = 1180, 1140
    draw_line(ux, uy, rel_rep_x, rel_rep_y, is_double=False)
    draw_line(ix, iy, rel_rep_x, rel_rep_y, is_double=True) # Total participation: every incident reported by user
    draw_relationship(rel_rep_x, rel_rep_y, 150, 70, "REPORTS")
    svg.append(f'<text x="{rel_rep_x-80}" y="{rel_rep_y-15}" class="role-text">[Reporter]</text>')
    svg.append(f'<text x="{rel_rep_x-50}" y="{rel_rep_y-35}" class="card-text">1</text>')
    svg.append(f'<text x="{rel_rep_x-30}" y="{rel_rep_y-55}" class="constraint-text">(0, N)</text>')
    svg.append(f'<text x="{rel_rep_x+45}" y="{rel_rep_y+30}" class="card-text">N</text>')
    svg.append(f'<text x="{rel_rep_x+65}" y="{rel_rep_y+48}" class="constraint-text">(1, 1)</text>')

    # -------------------------------------------------------------------------
    # RELATIONSHIP: ASSIGNED_TO between USERS and INCIDENTS (Role: Analyst)
    # With Descriptive Attribute: Assigned_date (like Start_date on MANAGES in Fig 3.2!)
    # -------------------------------------------------------------------------
    rel_ass_x, rel_ass_y = 1220, 1350
    draw_line(ux, uy, rel_ass_x, rel_ass_y, is_double=False)
    draw_line(ix, iy, rel_ass_x, rel_ass_y, is_double=False) # Partial: incident may be unassigned initially
    draw_relationship(rel_ass_x, rel_ass_y, 160, 70, "ASSIGNED_TO")
    svg.append(f'<text x="{rel_ass_x-85}" y="{rel_ass_y+20}" class="role-text">[Assigned Analyst]</text>')
    svg.append(f'<text x="{rel_ass_x-45}" y="{rel_ass_y-30}" class="card-text">1</text>')
    svg.append(f'<text x="{rel_ass_x-25}" y="{rel_ass_y-48}" class="constraint-text">(0, N)</text>')
    svg.append(f'<text x="{rel_ass_x+45}" y="{rel_ass_y-15}" class="card-text">N</text>')
    svg.append(f'<text x="{rel_ass_x+65}" y="{rel_ass_y-32}" class="constraint-text">(0, 1)</text>')
    # Descriptive attribute on ASSIGNED_TO diamond!
    draw_attribute(1220, 1460, 75, 25, "Assigned_date", "normal", rel_ass_x, rel_ass_y)

    draw_entity(ix, iy, 200, 70, "INCIDENTS")

    # -------------------------------------------------------------------------
    # 6. WEAK ENTITY: INVESTIGATIONS (2750, 950)
    # -------------------------------------------------------------------------
    inv_x, inv_y = 2750, 950
    # Identifying relationship: HAS_INVESTIGATION (Double Diamond)
    rel_hi_x, rel_hi_y = 2225, 1100
    draw_line(ix, iy, rel_hi_x, rel_hi_y, is_double=False)
    draw_line(inv_x, inv_y, rel_hi_x, rel_hi_y, is_double=True) # Weak entity has total participation
    draw_relationship(rel_hi_x, rel_hi_y, 190, 80, "HAS_INVESTIGATION", is_identifying=True)
    svg.append(f'<text x="{rel_hi_x-50}" y="{rel_hi_y-30}" class="card-text">1</text>')
    svg.append(f'<text x="{rel_hi_x-30}" y="{rel_hi_y-48}" class="constraint-text">(0, N)</text>')
    svg.append(f'<text x="{rel_hi_x+45}" y="{rel_hi_y-30}" class="card-text">N</text>')
    svg.append(f'<text x="{rel_hi_x+65}" y="{rel_hi_y-48}" class="constraint-text">(1, 1)</text>')

    # Weak entity attributes
    draw_attribute(2950, 850, 85, 26, "investigation_no", "partial_pk", inv_x, inv_y)
    draw_attribute(2960, 920, 65, 25, "Findings", "normal", inv_x, inv_y)
    draw_attribute(2960, 980, 65, 25, "Started_at", "normal", inv_x, inv_y)
    draw_attribute(2950, 1050, 75, 25, "Completed_at", "normal", inv_x, inv_y)
    draw_attribute(2860, 1090, 75, 25, "Duration_hours", "derived", inv_x, inv_y)

    # Relationship to USERS: CONDUCTS
    # Long orthogonal routing or smooth bezier to USERS
    rel_cnd_x, rel_cnd_y = 2100, 740
    svg.append(f'<path d="M {ux+50} {uy-30} Q 1400 680 {rel_cnd_x} {rel_cnd_y}" fill="none" stroke="#1e293b" stroke-width="2"/>')
    draw_line(inv_x, inv_y, rel_cnd_x, rel_cnd_y, is_double=True)
    draw_relationship(rel_cnd_x, rel_cnd_y, 160, 70, "CONDUCTS")
    svg.append(f'<text x="{rel_cnd_x-60}" y="{rel_cnd_y-20}" class="card-text">1</text>')
    svg.append(f'<text x="{rel_cnd_x+40}" y="{rel_cnd_y-25}" class="card-text">N</text>')

    draw_entity(inv_x, inv_y, 220, 65, "INVESTIGATIONS", is_weak=True)

    # -------------------------------------------------------------------------
    # 7. WEAK ENTITY: RESPONSE_ACTIONS (2750, 1550)
    # -------------------------------------------------------------------------
    res_x, res_y = 2750, 1550
    # Identifying relationship: HAS_RESPONSE (Double Diamond)
    rel_hr_x, rel_hr_y = 2225, 1400
    draw_line(ix, iy, rel_hr_x, rel_hr_y, is_double=False)
    draw_line(res_x, res_y, rel_hr_x, rel_hr_y, is_double=True) # Total participation
    draw_relationship(rel_hr_x, rel_hr_y, 180, 80, "HAS_RESPONSE", is_identifying=True)
    svg.append(f'<text x="{rel_hr_x-50}" y="{rel_hr_y+40}" class="card-text">1</text>')
    svg.append(f'<text x="{rel_hr_x-30}" y="{rel_hr_y+58}" class="constraint-text">(0, N)</text>')
    svg.append(f'<text x="{rel_hr_x+45}" y="{rel_hr_y+40}" class="card-text">N</text>')
    svg.append(f'<text x="{rel_hr_x+65}" y="{rel_hr_y+58}" class="constraint-text">(1, 1)</text>')

    # Weak entity attributes
    draw_attribute(2950, 1450, 75, 26, "action_seq", "partial_pk", res_x, res_y)
    draw_attribute(2960, 1520, 70, 25, "Action_type", "normal", res_x, res_y)
    draw_attribute(2960, 1590, 70, 25, "Description", "normal", res_x, res_y)
    draw_attribute(2950, 1660, 75, 25, "Action_status", "normal", res_x, res_y)
    draw_attribute(2860, 1710, 75, 25, "Performed_at", "normal", res_x, res_y)

    # Relationship to USERS: PERFORMS
    # With Descriptive Attribute: Approval_status (like Hours in Figure 3.2!)
    rel_prf_x, rel_prf_y = 2050, 1600
    svg.append(f'<path d="M {ux+60} {uy+30} Q 1300 1700 {rel_prf_x} {rel_prf_y}" fill="none" stroke="#1e293b" stroke-width="2"/>')
    draw_line(res_x, res_y, rel_prf_x, rel_prf_y, is_double=True)
    draw_relationship(rel_prf_x, rel_prf_y, 160, 70, "PERFORMS")
    svg.append(f'<text x="{rel_prf_x-60}" y="{rel_prf_y+20}" class="card-text">1</text>')
    svg.append(f'<text x="{rel_prf_x+40}" y="{rel_prf_y-20}" class="card-text">N</text>')
    # Descriptive attribute on PERFORMS diamond!
    draw_attribute(2050, 1710, 80, 25, "Approval_status", "normal", rel_prf_x, rel_prf_y)

    draw_entity(res_x, res_y, 220, 65, "RESPONSE_ACTIONS", is_weak=True)

    # -------------------------------------------------------------------------
    # 8. WEAK ENTITY: INCIDENT_STATUS_HISTORY (1700, 2100)
    # -------------------------------------------------------------------------
    sh_x, sh_y = 1700, 2100
    rel_ts_x, rel_ts_y = 1700, 1780
    draw_line(ix, iy, rel_ts_x, rel_ts_y, is_double=False)
    draw_line(sh_x, sh_y, rel_ts_x, rel_ts_y, is_double=True) # Total participation
    draw_relationship(rel_ts_x, rel_ts_y, 180, 80, "TRACKS_STATUS", is_identifying=True)
    svg.append(f'<text x="{rel_ts_x-25}" y="{rel_ts_y-50}" class="card-text">1</text>')
    svg.append(f'<text x="{rel_ts_x-45}" y="{rel_ts_y-32}" class="constraint-text">(0, N)</text>')
    svg.append(f'<text x="{rel_ts_x-25}" y="{rel_ts_y+50}" class="card-text">N</text>')
    svg.append(f'<text x="{rel_ts_x-45}" y="{rel_ts_y+68}" class="constraint-text">(1, 1)</text>')

    draw_attribute(1500, 2190, 70, 26, "history_seq", "partial_pk", sh_x, sh_y)
    draw_attribute(1610, 2230, 65, 25, "Old_status", "normal", sh_x, sh_y)
    draw_attribute(1720, 2240, 65, 25, "New_status", "normal", sh_x, sh_y)
    draw_attribute(1830, 2230, 65, 25, "Changed_at", "normal", sh_x, sh_y)
    draw_attribute(1940, 2190, 60, 25, "Remarks", "normal", sh_x, sh_y)

    draw_entity(sh_x, sh_y, 280, 65, "INCIDENT_STATUS_HISTORY", is_weak=True)

    # -------------------------------------------------------------------------
    # 9. WEAK ENTITY: RISK_ASSESSMENTS (1100, 2100)
    # -------------------------------------------------------------------------
    ra_x, ra_y = 1100, 2100
    rel_ar_x, rel_ar_y = 1400, 1750
    draw_line(ix, iy, rel_ar_x, rel_ar_y, is_double=False)
    draw_line(ra_x, ra_y, rel_ar_x, rel_ar_y, is_double=True) # Total participation
    draw_relationship(rel_ar_x, rel_ar_y, 180, 80, "ASSESSES_RISK", is_identifying=True)
    svg.append(f'<text x="{rel_ar_x+35}" y="{rel_ar_y-40}" class="card-text">1</text>')
    svg.append(f'<text x="{rel_ar_x-35}" y="{rel_ar_y+40}" class="card-text">N</text>')

    draw_attribute(900, 2190, 85, 26, "assessment_seq", "partial_pk", ra_x, ra_y)
    draw_attribute(1020, 2240, 75, 25, "Severity_score", "normal", ra_x, ra_y)
    draw_attribute(1140, 2250, 70, 25, "Asset_score", "normal", ra_x, ra_y)
    draw_attribute(1250, 2240, 70, 25, "Impact_score", "normal", ra_x, ra_y)
    draw_attribute(1340, 2190, 65, 25, "Risk_level", "normal", ra_x, ra_y)

    draw_entity(ra_x, ra_y, 230, 65, "RISK_ASSESSMENTS", is_weak=True)

    # -------------------------------------------------------------------------
    # 10. WEAK ENTITY: INCIDENT_EMBEDDINGS (Vector Component) (2300, 2100)
    # -------------------------------------------------------------------------
    emb_x, emb_y = 2300, 2100
    rel_vec_x, rel_vec_y = 2000, 1750
    draw_line(ix, iy, rel_vec_x, rel_vec_y, is_double=False)
    draw_line(emb_x, emb_y, rel_vec_x, rel_vec_y, is_double=True) # Total participation
    draw_relationship(rel_vec_x, rel_vec_y, 170, 80, "VECTORIZES", is_identifying=True)
    svg.append(f'<text x="{rel_vec_x-35}" y="{rel_vec_y-40}" class="card-text">1</text>')
    svg.append(f'<text x="{rel_vec_x+35}" y="{rel_vec_y+40}" class="card-text">1</text>')

    draw_attribute(2150, 2230, 80, 26, "embedding_no", "partial_pk", emb_x, emb_y)
    draw_attribute(2280, 2250, 85, 25, "vector(384_dim)", "normal", emb_x, emb_y)
    draw_attribute(2410, 2240, 75, 25, "Model_name", "normal", emb_x, emb_y)
    draw_attribute(2510, 2190, 65, 25, "Created_at", "normal", emb_x, emb_y)

    draw_entity(emb_x, emb_y, 250, 65, "INCIDENT_EMBEDDINGS", is_weak=True)

    # -------------------------------------------------------------------------
    # 11. ENTITY: AUDIT_LOGS (550, 1650)
    # -------------------------------------------------------------------------
    aud_x, aud_y = 550, 1650
    draw_attribute(400, 1560, 65, 26, "audit_id", "pk", aud_x, aud_y)
    draw_attribute(390, 1650, 60, 25, "Action", "normal", aud_x, aud_y)
    draw_attribute(410, 1740, 65, 25, "Description", "normal", aud_x, aud_y)
    draw_attribute(500, 1780, 65, 25, "Created_at", "normal", aud_x, aud_y)

    # Connected via LOGS_USER to USERS
    rel_lu_x, rel_lu_y = 650, 1380
    draw_line(ux, uy, rel_lu_x, rel_lu_y, is_double=False)
    draw_line(aud_x, aud_y, rel_lu_x, rel_lu_y, is_double=True)
    draw_relationship(rel_lu_x, rel_lu_y, 140, 65, "LOGS_USER")
    svg.append(f'<text x="{rel_lu_x+25}" y="{rel_lu_y-30}" class="card-text">1</text>')
    svg.append(f'<text x="{rel_lu_x-25}" y="{rel_lu_y+35}" class="card-text">N</text>')

    draw_entity(aud_x, aud_y, 170, 65, "AUDIT_LOGS")

    # =========================================================================
    # FORMAL TEXTBOOK NOTATIONS LEGEND (Matching Slide 1 - Figure 3.14!)
    # =========================================================================
    lx, ly = 60, 2340
    svg.append(f'<rect x="{lx}" y="{ly}" width="{W-120}" height="200" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5" rx="6"/>')
    svg.append(f'<text x="{lx+25}" y="{ly+30}" class="legend-title">Figure 3.14 / Slide Reference: Summary of Academic Notation for ER Diagrams (Chen / Elmasri &amp; Navathe Standard)</text>')

    # 1. Entity
    col1 = lx + 40
    svg.append(f'<rect x="{col1}" y="{ly+55}" width="80" height="30" fill="#ffffff" stroke="#1e293b" stroke-width="2"/>')
    svg.append(f'<text x="{col1+40}" y="{ly+72}" font-family="Arial" font-size="12" font-weight="bold" text-anchor="middle" dominant-baseline="middle">Entity</text>')
    svg.append(f'<text x="{col1+90}" y="{ly+72}" class="legend-text">Strong Entity Set</text>')

    # 2. Weak Entity
    svg.append(f'<rect x="{col1}" y="{ly+100}" width="80" height="30" fill="#ffffff" stroke="#1e293b" stroke-width="2"/>')
    svg.append(f'<rect x="{col1+3}" y="{ly+103}" width="74" height="24" fill="#ffffff" stroke="#1e293b" stroke-width="1.5"/>')
    svg.append(f'<text x="{col1+40}" y="{ly+117}" font-family="Arial" font-size="11" font-weight="bold" text-anchor="middle" dominant-baseline="middle">Weak Entity</text>')
    svg.append(f'<text x="{col1+90}" y="{ly+117}" class="legend-text">Weak Entity Set</text>')

    # 3. Relationship
    col2 = col1 + 250
    svg.append(f'<polygon points="{col2+40},{ly+55} {col2+80},{ly+70} {col2+40},{ly+85} {col2},{ly+70}" fill="#ffffff" stroke="#1e293b" stroke-width="2"/>')
    svg.append(f'<text x="{col2+40}" y="{ly+72}" font-family="Arial" font-size="11" font-weight="bold" text-anchor="middle" dominant-baseline="middle">Rel</text>')
    svg.append(f'<text x="{col2+90}" y="{ly+72}" class="legend-text">Relationship Set</text>')

    # 4. Identifying Relationship
    svg.append(f'<polygon points="{col2+40},{ly+100} {col2+80},{ly+115} {col2+40},{ly+130} {col2},{ly+115}" fill="#ffffff" stroke="#1e293b" stroke-width="2"/>')
    svg.append(f'<polygon points="{col2+40},{ly+104} {col2+74},{ly+115} {col2+40},{ly+126} {col2+6},{ly+115}" fill="#ffffff" stroke="#1e293b" stroke-width="1.5"/>')
    svg.append(f'<text x="{col2+40}" y="{ly+117}" font-family="Arial" font-size="10" font-weight="bold" text-anchor="middle" dominant-baseline="middle">Id Rel</text>')
    svg.append(f'<text x="{col2+90}" y="{ly+117}" class="legend-text">Identifying Rel</text>')

    # 5. Key Attribute
    col3 = col2 + 250
    svg.append(f'<ellipse cx="{col3+40}" cy="{ly+70}" rx="38" ry="16" fill="#ffffff" stroke="#1e293b" stroke-width="1.8"/>')
    svg.append(f'<text x="{col3+40}" y="{ly+72}" font-family="Arial" font-size="12" font-weight="bold" text-anchor="middle" dominant-baseline="middle" text-decoration="underline">Key</text>')
    svg.append(f'<text x="{col3+90}" y="{ly+72}" class="legend-text">Primary Key</text>')

    # 6. Partial Key
    svg.append(f'<ellipse cx="{col3+40}" cy="{ly+115}" rx="38" ry="16" fill="#ffffff" stroke="#1e293b" stroke-width="1.8"/>')
    svg.append(f'<text x="{col3+40}" y="{ly+116}" font-family="Arial" font-size="12" font-weight="bold" text-anchor="middle" dominant-baseline="middle">Partial</text>')
    svg.append(f'<line x1="{col3+22}" y1="{ly+124}" x2="{col3+58}" y2="{ly+124}" stroke="#0f172a" stroke-width="1.5" stroke-dasharray="2,2"/>')
    svg.append(f'<text x="{col3+90}" y="{ly+117}" class="legend-text">Partial Key (Disc.)</text>')

    # 7. Multivalued Attribute
    col4 = col3 + 250
    svg.append(f'<ellipse cx="{col4+40}" cy="{ly+70}" rx="38" ry="16" fill="#ffffff" stroke="#1e293b" stroke-width="1.8"/>')
    svg.append(f'<ellipse cx="{col4+40}" cy="{ly+70}" rx="33" ry="12" fill="#ffffff" stroke="#1e293b" stroke-width="1.3"/>')
    svg.append(f'<text x="{col4+40}" y="{ly+72}" font-family="Arial" font-size="11" text-anchor="middle" dominant-baseline="middle">Multi</text>')
    svg.append(f'<text x="{col4+90}" y="{ly+72}" class="legend-text">Multivalued Attr</text>')

    # 8. Derived Attribute
    svg.append(f'<ellipse cx="{col4+40}" cy="{ly+115}" rx="38" ry="16" fill="#ffffff" stroke="#1e293b" stroke-width="1.8" stroke-dasharray="4,3"/>')
    svg.append(f'<text x="{col4+40}" y="{ly+117}" font-family="Arial" font-size="11" text-anchor="middle" dominant-baseline="middle">Derived</text>')
    svg.append(f'<text x="{col4+90}" y="{ly+117}" class="legend-text">Derived Attribute</text>')

    # 9. Composite Attribute
    col5 = col4 + 250
    svg.append(f'<ellipse cx="{col5+30}" cy="{ly+70}" rx="25" ry="14" fill="#ffffff" stroke="#1e293b" stroke-width="1.5"/>')
    svg.append(f'<ellipse cx="{col5+75}" cy="{ly+58}" rx="18" ry="10" fill="#ffffff" stroke="#1e293b" stroke-width="1.2"/>')
    svg.append(f'<ellipse cx="{col5+75}" cy="{ly+82}" rx="18" ry="10" fill="#ffffff" stroke="#1e293b" stroke-width="1.2"/>')
    svg.append(f'<line x1="{col5+55}" y1="{ly+68}" x2="{col5+60}" y2="{ly+62}" stroke="#1e293b" stroke-width="1.2"/>')
    svg.append(f'<line x1="{col5+55}" y1="{ly+72}" x2="{col5+60}" y2="{ly+78}" stroke="#1e293b" stroke-width="1.2"/>')
    svg.append(f'<text x="{col5+30}" y="{ly+72}" font-family="Arial" font-size="10" text-anchor="middle" dominant-baseline="middle">Comp</text>')
    svg.append(f'<text x="{col5+105}" y="{ly+72}" class="legend-text">Composite Attr</text>')

    # 10. Total Participation
    svg.append(f'<line x1="{col5}" y1="{ly+112}" x2="{col5+60}" y2="{ly+112}" stroke="#1e293b" stroke-width="2"/>')
    svg.append(f'<line x1="{col5}" y1="{ly+118}" x2="{col5+60}" y2="{ly+118}" stroke="#1e293b" stroke-width="2"/>')
    svg.append(f'<text x="{col5+70}" y="{ly+117}" class="legend-text">Total Participation</text>')

    # 11. Partial Participation & Cardinality
    col6 = col5 + 240
    svg.append(f'<line x1="{col6}" y1="{ly+70}" x2="{col6+60}" y2="{ly+70}" stroke="#1e293b" stroke-width="2"/>')
    svg.append(f'<text x="{col6+70}" y="{ly+72}" class="legend-text">Partial Participation</text>')

    svg.append(f'<text x="{col6+10}" y="{ly+117}" font-family="Arial" font-size="14" font-weight="bold">1 : N , (min, max)</text>')
    svg.append(f'<text x="{col6+130}" y="{ly+117}" class="legend-text">Cardinality / Constraints</text>')

    svg.append('</svg>')
    return '\n'.join(svg)

# Write SVG and generate PNG
svg_str = create_chen_er_svg()
svg_path = r'D:\DBMS Mini Project\docs\database_design\01_CHEN_ER_DIAGRAM.svg'
with open(svg_path, 'w', encoding='utf-8') as f:
    f.write(svg_str)
print('Saved Chen ER SVG to:', svg_path)

doc = pymupdf.open(stream=svg_str.encode('utf-8'), filetype='svg')
page = doc[0]
pix = page.get_pixmap(dpi=200) # High-Res 200 DPI (approx 4500 x 3400 px)
png_path = r'D:\DBMS Mini Project\docs\database_design\01_CHEN_ER_DIAGRAM.png'
pix.save(png_path)
print(f'Saved High-Res Chen ER PNG ({pix.width}x{pix.height}) to: {png_path}')

