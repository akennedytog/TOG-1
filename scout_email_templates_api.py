
# Email Templates API endpoints - Add to scout_sales_api.py:

# ============ EMAIL TEMPLATES ============

@app.route('/api/templates', methods=['GET'])
def list_templates():
    """List all email templates"""
    category = request.args.get('category')
    
    with db.get_connection() as conn:
        query = "SELECT * FROM email_templates WHERE 1=1"
        params = []
        if category:
            query += " AND category = ?"
            params.append(category)
        query += " ORDER BY usage_count DESC"
        
        rows = conn.execute(query, params).fetchall()
        
        return jsonify({
            'templates': [
                {
                    'id': row['id'],
                    'name': row['name'],
                    'subject': row['subject'],
                    'body': row['body'][:200] + '...' if len(row['body']) > 200 else row['body'],
                    'category': row['category'],
                    'variables': json.loads(row['variables'] or '[]'),
                    'usage_count': row['usage_count'],
                    'is_default': row['is_default']
                }
                for row in rows
            ]
        })

@app.route('/api/templates', methods=['POST'])
def create_template():
    """Create new email template"""
    data = request.json
    
    template_id = str(uuid4())
    now = datetime.now().isoformat()
    
    # Extract variables from body using regex {{variable}}
    import re
    variables = re.findall(r'\{\{(\w+)\}\}', data.get('body', ''))
    variables = list(set(variables))  # Remove duplicates
    
    with db.get_connection() as conn:
        conn.execute("""
            INSERT INTO email_templates (id, name, subject, body, html_body, category, 
                variables, created_by, is_default, usage_count, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            template_id,
            data.get('name', ''),
            data.get('subject', ''),
            data.get('body', ''),
            data.get('html_body'),
            data.get('category', 'general'),
            json.dumps(variables),
            data.get('created_by'),
            data.get('is_default', False),
            0,
            now,
            now
        ))
        conn.commit()
    
    return jsonify({'id': template_id, 'message': 'Template created'}), 201

@app.route('/api/templates/<template_id>', methods=['GET'])
def get_template(template_id):
    """Get specific template"""
    with db.get_connection() as conn:
        row = conn.execute(
            "SELECT * FROM email_templates WHERE id = ?", (template_id,)
        ).fetchone()
        
        if not row:
            return jsonify({'error': 'Template not found'}), 404
        
        return jsonify({
            'id': row['id'],
            'name': row['name'],
            'subject': row['subject'],
            'body': row['body'],
            'html_body': row['html_body'],
            'category': row['category'],
            'variables': json.loads(row['variables'] or '[]'),
            'usage_count': row['usage_count'],
            'is_default': row['is_default']
        })

@app.route('/api/templates/<template_id>/render', methods=['POST'])
def render_template(template_id):
    """Render template with variables"""
    data = request.json
    variables = data.get('variables', {})
    
    template = get_template(template_id)
    if isinstance(template, tuple):  # Error response
        return template
    
    template = template.get_json()
    
    # Replace variables
    subject = template['subject']
    body = template['body']
    
    for key, value in variables.items():
        placeholder = '{{' + key + '}}'
        subject = subject.replace(placeholder, str(value))
        body = body.replace(placeholder, str(value))
    
    return jsonify({
        'subject': subject,
        'body': body
    })

# Default templates to insert
DEFAULT_TEMPLATES = [
    {
        'name': 'Follow-up After Call',
        'subject': 'Following up on our call - {{company}}',
        'body': '''Hi {{first_name}},

Thanks for taking the time to speak with me today. I enjoyed learning about {{company}} and your goals.

As discussed, I've attached the proposal for {{deal_value}}. This covers everything we talked about:

- {{key_point_1}}
- {{key_point_2}}

Next steps: {{next_steps}}

Let me know if you have any questions. I'm here to help.

Best,
{{sender_name}}''',
        'category': 'follow_up'
    },
    {
        'name': 'Proposal Check-in',
        'subject': 'Quick check-in: {{deal_name}} proposal',
        'body': '''Hi {{first_name}},

I wanted to follow up on the proposal I sent for {{deal_name}}.

Have you had a chance to review it? I'd be happy to walk through any questions or discuss adjustments.

Looking forward to your thoughts.

Best,
{{sender_name}}''',
        'category': 'follow_up'
    },
    {
        'name': 'Re-engagement',
        'subject': 'Catching up with {{company}}',
        'body': '''Hi {{first_name}},

It's been a while since we last connected. I wanted to reach out and see how things are going at {{company}}.

We've launched some new capabilities since we last spoke that might be relevant to your {{use_case}}.

Would you be open to a brief 15-minute catch-up call next week?

Best,
{{sender_name}}''',
        'category': 're_engagement'
    },
    {
        'name': 'Introduction',
        'subject': 'Welcome to Scout CRM',
        'body': '''Hi {{first_name}},

Welcome! I'm excited to help {{company}} with {{goal}}.

Here are a few resources to get started:
- Onboarding guide
- Best practices
- Support contact

Let me know if you have any questions.

Best,
{{sender_name}}''',
        'category': 'introduction'
    },
    {
        'name': 'Check-in',
        'subject': 'Quarterly check-in: {{company}}',
        'body': '''Hi {{first_name}},

It's been {{time_since_last_contact}} since we last connected. I wanted to check in on how things are going.

How is {{company}} performing? Any new challenges or opportunities I should know about?

I'm here if you need anything.

Best,
{{sender_name}}''',
        'category': 'relationship'
    }
]

def insert_default_templates():
    """Insert default templates if none exist"""
    with db.get_connection() as conn:
        count = conn.execute("SELECT COUNT(*) FROM email_templates").fetchone()[0]
        if count == 0:
            for template in DEFAULT_TEMPLATES:
                template_id = str(uuid4())
                import re
                variables = re.findall(r'\{\{(\w+)\}\}', template['body'])
                variables = list(set(variables))
                
                conn.execute("""
                    INSERT INTO email_templates (id, name, subject, body, category, 
                        variables, is_default, usage_count, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    template_id, template['name'], template['subject'], 
                    template['body'], template['category'],
                    json.dumps(variables), True, 0,
                    datetime.now().isoformat(), datetime.now().isoformat()
                ))
            conn.commit()
            print(f"Inserted {len(DEFAULT_TEMPLATES)} default templates")
