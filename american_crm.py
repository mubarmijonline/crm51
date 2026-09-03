from flask import Flask, render_template, request, url_for, redirect, flash, session, app,jsonify
from flask import url_for as flask_url_for
from dbconnection import connection
from flask_pymongo import PyMongo
from pymongo import MongoClient
import MySQLdb
import csv  
import json
import sys
import datetime
import time
import os
import re
import urllib
import pymongo
import glob

from flask_mail import Mail, Message
import random, string

from datetime import timedelta
from datetime import date

import pandas as pd
import numpy as np
from pandas import ExcelWriter
from pandas import ExcelFile
import openpyxl
from bson.objectid import ObjectId

app = Flask(__name__)
#Bootst/projects/51_apps/psCalc/templatesrap(app)
app.secret_key = os.environ["SECRET_KEY"]


def get_notification_mongo():

    client = pymongo.MongoClient("mongodb://localhost:27017/")

    mydb = client["crm_51"]
    collection = mydb['notifications']

    return collection,client

def get_reply_mongo():

    client = pymongo.MongoClient("mongodb://localhost:27017/")

    mydb = client["crm_51"]
    collection = mydb['reply']

    return collection,client

def get_american_mongo():

    client = pymongo.MongoClient("mongodb://localhost:27017/")

    mydb = client["crm_51"]
    collection = mydb['american_notes']

    return collection,client

def get_event_mongo():

    client = pymongo.MongoClient("mongodb://localhost:27017/")

    mydb = client["crm_51"]
    collection = mydb['event_notes']

    return collection,client


#mycollection = get_mongo()


# =============================================================================
# Cache busting for static assets.
#
# nginx serves /static/ with "Cache-Control: public, max-age=31536000,
# immutable". immutable means the browser will not revalidate at all, so an
# edited stylesheet stays invisible until someone clears their cache - which is
# exactly what happened during this revamp.
#
# The header is correct as long as the URL changes when the file does, so
# url_for('static', ...) now appends the file's mtime. Same filename on disk,
# new URL after every edit, and the year-long cache stays valid per version.
# =============================================================================
def dated_url_for(endpoint, **values):
    if endpoint == 'static':
        filename = values.get('filename')
        if filename:
            try:
                values['v'] = int(os.stat(
                    os.path.join(app.static_folder, filename)).st_mtime)
            except OSError:
                pass          # missing file: let url_for build the plain URL
    return flask_url_for(endpoint, **values)


@app.context_processor
def _inject_dated_url_for():
    return dict(url_for=dated_url_for)


# Endpoints a member of the public may reach: the external course form and the
# two lookups it needs to render.
PUBLIC_ENDPOINTS = {'login', 'register', 'static', 'course_form',
                    'get_form_course_data', 'get_educational_system_data'}


@app.before_request
def before_request():
    if request.endpoint in PUBLIC_ENDPOINTS:
        return

    if 'name' not in session:
        session.clear()
        return redirect(url_for('login'))

    # Submitting the public course form assigns a session - name
    # 'External Course Form', id 0, role 'ExternalUser' - so that
    # creating_american_lead has an author to record. Only four routes ever
    # checked for it, which left the rest of the CRM open to anyone who had
    # filled in that form once: /american_db rendered, and /api/american_leads
    # returned every lead with names, mobiles and emails.
    #
    # That pseudo-session is now treated as no session at all outside the
    # public endpoints above.
    if (session.get('role') == 'ExternalUser'
            or session.get('name') == 'External Course Form'
            or session.get('id') == 0):
        session.clear()
        return redirect(url_for('login'))


def creating_american_lead(student_mobile, student_name, parent_mobile,year, gender, educational_system, school, email,course, source, status, recall_date,not_interested_notes, deposit,trial,maths,english,other, added_by, system_section, assigned_to,notes,done):
    print(student_mobile, student_name, parent_mobile,year, gender, educational_system, school, email,course, source, status, recall_date,not_interested_notes, deposit,trial,maths,english,other, added_by, system_section, assigned_to,notes,done)
    print(type(assigned_to))
    stop_criteria = []
    student_mobile=int(student_mobile)
    if student_mobile == '':
        stop_criteria.append('student_mobile missing')
    if student_name == '':
        stop_criteria.append('student_name missing')
    if educational_system == '':
        stop_criteria.append('educational_system missing')

    if status == '':
        stop_criteria.append('status missing')
    if len(assigned_to) == 0:
        stop_criteria.append('assignation missing')
    if course == '':
        stop_criteria.append('course is missing')

    conn,cur=connection()
    if len(stop_criteria) > 0:
        error =  ' & '.join(stop_criteria)
        cur.close()
        conn.close()
        return {'state':'error','reason':error}
    else:
        
        student_count  = cur.execute("select student_id from american_leads where student_mobile=%s",(int(student_mobile),))
        if int(student_count) > 0 :
            (exist_student_id,)=cur.fetchone()
            cur.close()
            conn.close()
            if added_by == 'Course Form User':
                #return {'state':'error','reason':'student is already exist, Kindly contact us ( +201112515151 )'}
                return {'state':'error','reason':'student is already exist, Kindly contact us ( +201020144893 )'}
            else:
                return {'state':'error','reason':'student is already exist in DB with ID = '+str(exist_student_id)}
        else:

            cur.execute("INSERT INTO american_leads(student_mobile,student_name,parent_mobile,gender,educational_system,course,school,email,source,status,recall_date,not_interested_notes,deposit,trial,maths,english,other,added_by,system_section,done,year) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)",(student_mobile,student_name,parent_mobile,gender,educational_system,course,school,email,source,status,recall_date,not_interested_notes,deposit,trial,maths,english,other,added_by,system_section,done,year,))
            conn.commit()
            cur.execute("select student_id from american_leads where student_mobile=%s and student_id=(SELECT LAST_INSERT_ID())",(student_mobile,))
            (student_id,)=cur.fetchone()
            assi_feedback=add_assignation(assigned_to,student_id,student_mobile,'American',True)
            if assi_feedback != 'success':
                cur.execute("delete from american_leads where student_id=%s and student_mobile=%s",(student_id,student_mobile,))
                cur.execute("delete from assignation where student_id=%s and student_mobile=%s",(student_id,student_mobile,))
                collection,client = get_notification_mongo()
                collection.delete_many({"student_id":student_id,"section":"american"})
                client.close()
                conn.commit()
                cur.close()
                conn.close()
                return {'state':'error','reason':'Error in assignation'}
            add_notes(student_id,student_mobile,notes)
            course_list = course.split(',')
            for courses in course_list:
                xy=cur.execute("select id from course where course=%s and hold=false",(courses,))
                if int(xy) ==1:
                        (course_id,)=cur.fetchone()
                else:
                        course_id=None   
                cur.execute("INSERT into course_status (course_id,course,status,student_id) VALUES (%s,%s,'pending',%s)",(course_id,courses,student_id,))
                
            conn.commit()
            cur.close()
            conn.close()
            if added_by == 'Course Form User':
                return {'state':'success','reason':'added_successfully'}
            else:

                return {'state':'success','reason':'added_successfully'}


def add_assignation(assigned_to,student_id,student_mobile,source,create_notifcation_flag):
    
    if len(assigned_to) == 0:

        return 'failed'
    conn,cur=connection()
    try:
        
        for username in assigned_to:
            cur.execute("select user_id from user where username=%s",(username,))
            (user_id,)=cur.fetchone()
            cur.execute("INSERT into assignation(user_id,student_id,student_mobile,username,source) VALUES (%s,%s,%s,%s,%s)",(user_id,student_id,int(student_mobile),username,source))
            conn.commit()
            if create_notifcation_flag:
                add_notifications(username,user_id,student_id,"New Course Lead Added","New course lead added & assigned to you")
            else:
                add_notifications(username,user_id,student_id,"Course Lead Updated","One of the course leads which assigned to you updated")
        cur.close()
        conn.close()
        return 'success'
    except Exception as e:
        cur.close()
        conn.close()
        return 'failed'


def add_notes(student_id,student_mobile,notes):
    collection,client = get_american_mongo()
    date_now_mongo = datetime.datetime.now()
    added_datetime_standard_mongo = date_now_mongo.strftime("%Y-%m-%d %H:%M:%S")
    added_datetime_mongo = date_now_mongo.strftime("%Y-%m-%d %I:%M %p")
    collection.insert_one({"student_id":int(student_id),"student_mobile":student_mobile,"notes":notes,"added_date":added_datetime_mongo,'added_date_standard':added_datetime_standard_mongo,"added_by":session['name'],})
    client.close()

def add_notifications(username,user_id,student_id,title,notification):

    try:
         
        collection,client = get_notification_mongo()
        date_now_mongo = datetime.datetime.now()
        added_datetime_standard_mongo = date_now_mongo.strftime("%Y-%m-%d %H:%M:%S")
        added_datetime_mongo = date_now_mongo.strftime("%Y-%m-%d %I:%M %p")
        conn,cur=connection()
        student_mobile='Profile Deleted'
        tt=cur.execute("select student_mobile from american_leads where student_id=%s",(student_id,))
        if int(tt) ==1:
            (student_mobile,)=cur.fetchone()

        collection.insert_one({"username":username,"user_id":user_id,"title":title,"message":notification + " for Student ID  "+str(student_id),"added_by":session['name'],"added_date":added_datetime_standard_mongo,"student_id":student_id,"section":"american","read":False,"student_mobile":student_mobile})
        cur.close()
        conn.close()
        client.close()
        return 'success'
    except Exception as e:
        print(e)
        return 'failed'

def add_event_notifications(username,user_id,client_id,title,notification):

    try:
         
        collection,client = get_notification_mongo()
        date_now_mongo = datetime.datetime.now()
        added_datetime_standard_mongo = date_now_mongo.strftime("%Y-%m-%d %H:%M:%S")
        added_datetime_mongo = date_now_mongo.strftime("%Y-%m-%d %I:%M %p")
        conn,cur=connection()
        client_mobile='Client Profile Deleted'
        tt=cur.execute("SELECT client_mobile FROM event_client WHERE client_id=%s",(client_id,))
        if int(tt) ==1:
            (client_mobile,)=cur.fetchone()

        collection.insert_one({"username":username,"user_id":user_id,"title":title,"message":notification + " for Client ID  "+str(client_id),"added_by":session['name'],"added_date":added_datetime_standard_mongo,"client_id":client_id,"section":"event","read":False,"client_mobile":client_mobile})
        cur.close()
        conn.close()
        client.close()
        return 'success'
    except Exception as e:
        print(e)
        return 'failed'
        
        
@app.route('/read_notifications', methods=["GET","POST"])
def read_notifications():
        
        #conn, cur = connection()
        #mobile= "01024527770"
        username= session['name']
        notification_id = request.args['notification_id']
        true_false=request.args['true_false']
        if true_false == "true":
            true_false = True
        else:
            true_false=False
        collection,client = get_notification_mongo()

        myquery = { "_id":ObjectId(notification_id)}
        newvalues = { "$set": { "read": true_false } }
        
        x=collection.update_many(myquery, newvalues)
        #print(cursor)
        print(x.modified_count, "documents updated.")
        client.close()
        
        return jsonify({"state":"done"}) 

@app.route('/get_notifications', methods=["GET","POST"])
def get_notifications():
        username = session['name']
        user_id = session['id']
        collection,client = get_notification_mongo()

        #conn, cur = connection()
        

        cursor = collection.find({"user_id": user_id}).sort("added_date",-1)
        #   print(cursor)
        
        json_data=[]
        for doc in cursor:
            doc['_id']=str(doc['_id'])
            json_data.append(doc)

        
        client.close()
        return jsonify(json_data)

@app.route('/get_reply', methods=["GET","POST"])
def get_reply():

        collection,client = get_reply_mongo()

        #conn, cur = connection()
        notification_id = request.args['notification_id']
        notification_id = str(notification_id)
        print(notification_id)
        cursor = collection.find({"notification_id": notification_id}).sort("added_date",-1)
        #   print(cursor)
        
        json_data=[]
        for doc in cursor:
            doc['_id']=str(doc['_id'])
            doc['notification_id']=str(doc['notification_id'])
            json_data.append(doc)

        
        client.close()
        print("DONE")
        return  ("{ \"data\" :" + json.dumps(json_data, default=str) + " } ")

@app.route('/get_all_notifications',methods=["GET", "POST"])
def get_all_notifications():
    user_id = session['id']
    json_data=[]
    
    collection,client = get_notification_mongo()
    
    for x in collection.find({'$or': [{'user_id': user_id},{"added_by": str(session['name']),'section':'To Do List'}]}).sort("added_date",-1):

            x['_id']=(x['_id'])
            
            try:
                yy=x['student_mobile']
            except:
                x['student_mobile']=''
            if x['section'] == 'event':
                x['student_mobile'] = x['client_mobile']
                x['student_id'] = x['client_id']
            json_data.append(x)
    #else:
    #    for x in collection.find({"user_id": user_id}).sort("added_date",-1):
    #        x['_id']=(x['_id'])
    #        try:
    #            yy=x['student_mobile']
    #        except:
    #            x['student_mobile']=''
    #        json_data.append(x)
    client.close()

    return ("{ \"data\" :" + json.dumps(json_data, default=str) + " } ")


@app.route('/get_course_status',methods=["GET", "POST"])
def get_course_status():
    print("#############################################################")
    
    conn, cur = connection()
    student_id=request.args['student_id']
    print(student_id)
    Query="SELECT * FROM course_status where student_id="+str(student_id)

    cur.execute(Query)
    row_headers = [x[0] for x in cur.description]  # this will extract row headers

    rv = cur.fetchall()
    
    json_data = []
    for result in rv:
        json_data.append(dict(zip(row_headers, result)))

    cur.close()
    conn.close()    
    return ("{ \"data\" :" + json.dumps(json_data, default=str) + " } ")


@app.route('/get_read_notifications', methods=["GET","POST"])
def get_read_notifications():
        username = session['name']
        user_id = session['id']
        collection,client = get_notification_mongo()

        #conn, cur = connection()
        

        cursor = collection.find({"user_id": user_id,"read":False}).sort("added_date",-1)
        #   print(cursor)
        
        json_data=[]
        for doc in cursor:
            doc['_id']=str(doc['_id'])
            json_data.append(doc)

        
        client.close()
        return jsonify(json_data)

@app.route('/go_to_lead', methods=["GET","POST"])
def go_to_lead():
        if request.method == 'POST':
                conn,cur=connection()
            
                section = request.args['section']
                print(section)
                if section == 'american':
                    student_id = request.args['student_id']
                    print(student_id,section)
                    x=cur.execute('select student_id,student_name,student_mobile from american_leads where student_id=%s',(student_id,))
                    #21 - 1025437654 - Ahmed hassan
                    if int(x) ==1:
                        (student_id_q,student_name,student_mobile,)=cur.fetchone()
                        student_data = str(student_id_q)+" - "+str(student_mobile)+" - "+str(student_name)
                        cur.close()
                        conn.close()
                        return({'state':'success_american','student_data':student_data})
                    else:
                        cur.close()
                        conn.close()
                        return({'state':'error'})

                elif section == 'event':
                    client_id = request.args['client_id']
                    x=cur.execute('select client_id, client_name, client_mobile'
                                  ' from event_client where client_id=%s',(client_id,))

                    if int(x) ==1:
                        (client_id_q,client_name,client_mobile,)=cur.fetchone()
                        client_data = str(client_id_q)+" - "+str(client_mobile)+" - "+str(client_name)
                        cur.close()
                        conn.close()
                        return({'state':'success_event','client_data':client_data})
                    else:
                        cur.close()
                        conn.close()
                        return({'state':'error'})


@app.route('/change_status_course', methods=["GET","POST"])
def change_status_course():
        if request.method == 'POST':
                    conn,cur=connection()
            
                    myid = request.args['myid']
                    status_value = request.args['status_value']
                
                
                    
                    x=cur.execute('select id from course_status where id=%s',(myid,))
                    #21 - 1025437654 - Ahmed hassan
                    if int(x) ==1:
                        cur.execute("update course_status set status=%s where id=%s",(status_value,myid,))
                        conn.commit()
                        cur.close()
                        conn.close()
                        return({'state':'success'})
                    else:
                        cur.close()
                        conn.close()
                        return({'state':'error'})
                    


                    

    










### STUDENTS DB ###
@app.route('/get_student_DB_data',methods=["GET", "POST"])
def get_student_DB_data():

    print("#############################################################")
    
    conn, cur = connection()
    username = session['name']
    role = session['role']
    if role.lower() == 'admin':
        Query="SELECT * FROM students;"
    else:
         Query="SELECT * FROM students where assigned_to='"+username+"'"
    cur.execute(Query)
    row_headers = [x[0] for x in cur.description]  # this will extract row headers

    rv = cur.fetchall()
    print(rv)
    json_data = []
    for result in rv:
        json_data.append(dict(zip(row_headers, result)))

    cur.close()
    conn.close()     
    
    return ("{ \"data\" :" + (json.dumps(json_data , default=str)) + " } ")


@app.route('/suggesion_data_american',methods=["GET", "POST"])
def suggesion_data():

    if request.method == 'POST':
        conn, cur = connection()
        username = session['name']
        role = session['role']
        user_id=session['id']
        
        Query="SELECT student_id,student_mobile,student_name FROM american_leads"

        
        cur.execute(Query)
        records=cur.fetchall()
        json_data = []
        for row in records:
            suggestion = str(row[0])+" - "+str(row[1])+" - "+str(row[2])
            json_data.append(suggestion)
        cur.close()
        conn.close()     
        
        return (json_data)


@app.route('/suggesion_data_event',methods=["GET", "POST"])
def suggesion_data_event():

    if request.method == 'POST':
        conn, cur = connection()
        username = session['name']
        role = session['role']
        user_id=session['id']
        
        # Clients, not leads. A client with three events is still one entry
        # in the search box; the events live on the page you land on.
        Query = "SELECT client_id, client_mobile, client_name FROM event_client"

        cur.execute(Query)
        records=cur.fetchall()
        json_data = []
        for row in records:
            suggestion = str(row[0])+" - "+str(row[1])+" - "+str(row[2])
            json_data.append(suggestion)
        cur.close()
        conn.close()     
        
        return (json_data)


@app.route('/change_done',methods=["GET", "POST"])
def change_done():

    if request.method == 'POST':
        conn, cur = connection()
        try:
            
            student_id = request.form['student_id']

            cur.execute("select done from american_leads where student_id=%s",(student_id,))
            (done,)=cur.fetchone()
            if str(done) == "1":
                done = "0"
            else:
                done="1"

            Query="update american_leads set done = "+str(done)+" where student_id="+student_id
            cur.execute(Query)
            conn.commit()
            cur.close()
            conn.close()     
            
            return jsonify({"state":"success","reason":"State Changed"})
        except Exception as e:
                cur.close()
                conn.close() 
                return jsonify({"state":"error","reason":"Something went wrong"})

@app.route('/change_done_event',methods=["GET", "POST"])
def change_done_event():

    if request.method == 'POST':
        conn, cur = connection()
        try:
            
            event_id = request.form.get('event_id') or request.form['client_id']

            cur.execute("select done from event_event where event_id=%s", (event_id,))
            row = cur.fetchone()
            if row is None:
                return jsonify({"state": "failed", "reason": "No such event"})
            done = "0" if str(row[0]) == "1" else "1"

            cur.execute("update event_event set done = %s where event_id = %s",
                        (done, event_id))
            conn.commit()
            cur.close()
            conn.close()     
            
            return jsonify({"state":"success","reason":"State Changed"})
        except Exception as e:
                cur.close()
                conn.close() 
                return jsonify({"state":"error","reason":"Something went wrong"})

@app.route('/create_lead_american',methods=["GET", "POST"])
def create_lead_american():

    if request.method == 'POST' and 'add_lead':
        
        student_mobile=int(request.form['student_mobile'])
        student_name=request.form['student_name']
        parent_mobile=request.form['parent_mobile']
        try:
            gender=request.form['gender']
        except:
            gender = ""

        try:
            year=request.form['year']
        except:
            year = ""

        school=request.form['school']

        educational_system = request.form['educational_system']

        course = request.form.getlist('course[]')
        courses_items=[]
        conn,cur=connection()
        for courses_unholded in course:
            unhold_courses_count=cur.execute("select id from course where course=%s and hold=false",(courses_unholded,))
            if unhold_courses_count != 1:
                return jsonify({"state":"course_holded","reason":"One of The Courses is now holded"})
            
        if len(course) == 0:
            return jsonify({"state":"error","reason":"Course is a Mandotory Field"}) 
        else:
            course = ",".join(course)
        email=request.form['email']
        source=request.form['source']
        status = request.form['status']
        
        if status == "not_interested":
            not_interested_notes = request.form['not_interested_notes']
            recall_date = None
        else :
            not_interested_notes = ""
            recall_date=request.form['recall_date']
            if str(recall_date) == "":
                recall_date = None
            

        trial = request.form['trial']
        if trial == "yes":
            trial = "1"
            maths = request.form['math']
            if maths == None or str(maths) == '':
                maths =None
            english = request.form['english']
            if english == None or str(english) == '':
                english =None
            other = request.form['other']
            if other == None or str(other) == '':
                other =None
        else:
            trial = "0"
            maths = None
            english = None
            other = None
        
        try:
            deposit=request.form['deposit']
        except:
            deposit = None
        
        notes=request.form['notes']
        
    
        added_by=session['name']
        assigned_to = request.form.getlist('assigned_to[]')
        if session['role'] == 'admin':

            if int(len(assigned_to)) == 0:
                return jsonify({"state":"error","reason":"Assingation is a Mandotory Field"})
        else:
            assigned_to=[session['name']] ## by default assigned to the session username

        system_section='Manual Create Lead'
        done="0"
        response={}
        print(assigned_to)
        function_response = creating_american_lead(student_mobile, student_name, parent_mobile,year, gender, educational_system, school, email,course, source, status, recall_date,not_interested_notes, deposit,trial,maths,english,other, added_by, system_section, assigned_to,notes,done)
        return jsonify(function_response)

    return render_template("create_lead_american.html")


@app.route('/get_event_lead_data',methods=["GET", "POST"])
def get_event_lead_data():

    conn, cur = connection()
    selection = request.args['selected_data']
    print
    match = re.match('^([0-9]+) - (.*) - (.*)$',selection)
    if match:
        client_id = match.group(1)
        client_mobile = match.group(2)
        client_name = match.group(3)
        print(client_id)
    Query="SELECT client_id, client_name, client_mobile, client_email, status, client_payment_status, client_assets_list, client_deposit_flag, client_deposit, client_remaining, client_total, client_not_interested_notes, CONVERT(recall_date,CHAR) as recall_date, CONVERT(added_date,CHAR) as added_date, temperature FROM event_leads WHERE client_id="+str(client_id)
    cur.execute(Query)
    row_headers = [x[0] for x in cur.description]  # this will extract row headers

    rv = cur.fetchall()
    print(rv)
    json_data = []
    
    for result in rv:
        json_data.append(dict(zip(row_headers, result)))

    Query="SELECT username FROM event_assignation where client_id="+str(client_id)
    cur.execute(Query)
     # this will extract row headers

    rv = cur.fetchall()
    user_data = []
    for result in rv:
        user_data.append(result[0])
    users = [user_data]    # to response the list to the front-end because zip take first elemenet from first list and take the first element from the second list 

    json_data.append(dict(zip(['username_assignation'], users)))
    print(json_data)

    Query="SELECT * FROM event_check_list WHERE client_id="+str(client_id)
    cur.execute(Query)
     # this will extract row headers

    row_headers = [x[0] for x in cur.description]  # this will extract row headers

    rv = cur.fetchall()
    print(rv)
    check_list=[]
    for result in rv:
        check_list.append(dict(zip(row_headers, result)))

    cur.close()
    conn.close()

    return (jsonify(json_data[0],json_data[1],check_list))

#### EVENT CREATE ####
@app.route('/create_lead_event',methods=["GET", "POST"])
def create_lead_event():
    if request.method == 'POST' and 'create_event' in request.args:

        print("CREATING EVENT LEADS")

        print(request.form)

        try:
            client_mobile = request.form['client_mobile']
            client_name = request.form['client_name']
            client_email = request.form['email']

            status = request.form['status']
            if status == "not_interested":
                not_interested_notes = request.form['not_interested_notes']
                if not_interested_notes == '' or not_interested_notes == None:
                    return {'state':'error','reason':'Please add Reason for Not Interested'}
                recall_date = None

            elif status == "pending" or status == "not_contacted":
                recall_date = request.form['recall_date']
                if recall_date == '' or recall_date == None:
                    return {'state':'error','reason':'Please add Recall Date!'}
                not_interested_notes = ""

            else : # enrol case.
                not_interested_notes = ""
                recall_date = None
            
            client_deposit_flag = request.form['client_deposit_flag']
            if client_deposit_flag == '1':
                client_deposit = request.form['client_deposit']
            else:
                client_deposit = 0

            assigned_to = request.form.getlist('assigned_to[]')

            assets_list = request.form['assets_list']

            try:
                check_list = request.form.getlist('check_box')
                check_list_hidden = request.form.getlist('check_box_hidden')

                for item in check_list:
                    if item in check_list_hidden:
                        check_list_hidden.remove(item)

                print(check_list)
                print(check_list_hidden)
            except:
                check_list = ""
                check_list_hidden = ""
            
            try:
                temperature = request.form['temperature']
            except:
                temperature = ""

            client_payment_status = "pending"

            print(client_mobile, client_name, client_email, status, not_interested_notes, recall_date, client_deposit_flag, client_deposit, assigned_to, assets_list, check_list, check_list_hidden)

            function_response = creating_event_lead(client_mobile, client_name, client_email, status, not_interested_notes, recall_date, client_deposit_flag, client_deposit, assigned_to, assets_list, check_list, check_list_hidden, client_payment_status)
        
            return jsonify(function_response)

        except Exception as e:
            print(e)
            return({'state':'error'})

    return render_template("create_lead_event.html")

def creating_event_lead(client_mobile, client_name, client_email, status, not_interested_notes, recall_date, client_deposit_flag, client_deposit, assigned_to, assets_list, check_list, check_list_hidden, client_payment_status):
    
    try:

        print(client_mobile, client_name, client_email, status, not_interested_notes, recall_date, client_deposit_flag, client_deposit, assigned_to, assets_list, check_list)
        stop_criteria = []
        client_mobile=int(client_mobile)
        if client_mobile == '':
            stop_criteria.append('client_mobile missing')
        if client_name == '':
            stop_criteria.append('client_name missing')


        if status == '':
            stop_criteria.append('status missing')
        if len(assigned_to) == 0:
            stop_criteria.append('assignation missing')

        conn,cur=connection()
        if len(stop_criteria) > 0:
            error =  ' & '.join(stop_criteria)
            cur.close()
            conn.close()
            return {'state':'error','reason':error}
        else:
            
            # A client is identified by their mobile. Booking a second event for
            # someone already on file adds an event to them rather than being
            # refused as a duplicate, which is the whole point of the split.
            client_count = cur.execute(
                "select client_id from event_client where client_mobile=%s",
                (int(client_mobile),))
            if int(client_count) > 0:
                (client_id,) = cur.fetchone()
                cur.execute("SELECT COUNT(*) FROM event_event WHERE client_id=%s", (client_id,))
                event_name = 'Event %d' % (int(cur.fetchone()[0]) + 1)
            else:
                cur.execute(
                    "INSERT INTO event_client (client_mobile, client_name, client_email,"
                    " added_date, added_by) VALUES (%s,%s,%s,NOW(),%s)",
                    (client_mobile, client_name, client_email, str(session['name'])))
                client_id = cur.lastrowid
                event_name = 'Event 1'

            if True:
                cur.execute(
                    "INSERT INTO event_event (client_id, event_name, status,"
                    " not_interested_notes, recall_date, deposit_flag, deposit,"
                    " assets_list, payment_status, temperature, done, added_date, added_by)"
                    " VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,'hot',0,NOW(),%s)",
                    (client_id, event_name, status, str(not_interested_notes), recall_date,
                     client_deposit_flag, client_deposit, assets_list,
                     client_payment_status, str(session['name'])))
                event_id = cur.lastrowid
                conn.commit()

                assi_feedback = add_event_assignation(assigned_to, client_id, client_mobile,
                                                      True, event_id)

                for item in check_list:
                    cur.execute("INSERT INTO event_check_list (client_id, event_id, item, checked)"
                                " VALUES (%s, %s, %s, %s)", (client_id, event_id, item, 1))
                for item in check_list_hidden:
                    cur.execute("INSERT INTO event_check_list (client_id, event_id, item, checked)"
                                " VALUES (%s, %s, %s, %s)", (client_id, event_id, item, 0))

                if assi_feedback != 'success':
                    cur.execute("delete from event_event where event_id=%s", (event_id,))
                    cur.execute("delete from event_assignation where event_id=%s", (event_id,))
                    cur.execute("delete from event_check_list where event_id=%s", (event_id,))
                    cur.execute("delete from event_client where client_id=%s"
                                " and not exists (select 1 from event_event where client_id=%s)",
                                (client_id, client_id))

                    collection,client = get_notification_mongo()
                    collection.delete_many({"client_id":client_id,"section":"event"})
                    client.close()

                    conn.commit()
                    cur.close()
                    conn.close()
                    return {'state':'error','reason':'Error in assignation'}
    
                conn.commit()
                cur.close()
                conn.close()
                
                return {'state':'success','reason':'added_successfully'}

    except Exception as e:
        print(e)
        return {'state':'error','reason':'Fatal Error in assignation'}

def add_event_assignation(assigned_to, client_id, client_mobile, create_notifcation_flag,
                          event_id=None):
    """Assign an event. The duplicate check is per event now: the same person
    can own two different events for one client, which the old check by mobile
    alone would have refused."""
    if len(assigned_to) == 0:

        return 'failed'
    conn,cur=connection()
    try:

        for username in assigned_to:
            if event_id is not None:
                check_if_already_assigend = cur.execute(
                    "select id from event_assignation where event_id=%s AND username=%s",
                    (event_id, username,))
            else:
                check_if_already_assigend = cur.execute(
                    "select id from event_assignation where client_mobile=%s AND username=%s",
                    (int(client_mobile), username,))
            if int(check_if_already_assigend) > 0:
                continue # already assigned

            cur.execute("select user_id from user where username=%s",(username,))
            (user_id,)=cur.fetchone()
            cur.execute("INSERT into event_assignation(user_id, client_id, event_id,"
                        " client_mobile, username) VALUES (%s,%s,%s,%s,%s)",
                        (user_id, client_id, event_id, int(client_mobile), username,))
            conn.commit()
            if create_notifcation_flag:
                add_event_notifications(username,user_id,client_id,"New Event Lead Added","New Event lead added & assigned to you")
            else:
                add_event_notifications(username,user_id,client_id,"Event Lead Updated","One of the Event leads which is assigned to you have been updated")
        cur.close()
        conn.close()
        return 'success'
    except Exception as e:
        print(e)
        cur.close()
        conn.close()
        return 'failed'

@app.route('/event_db', methods=["GET","POST"])
def event_db():
    return render_template("event_db.html")

@app.route('/get_all_event_lead_data',methods=["GET", "POST"])
def get_all_event_lead_data():

    conn, cur = connection()

    #if session['role'] == 'admin':
    #    Query="SELECT * FROM event_leads"
    #else:
    #    Query="SELECT * FROM event_leads WHERE client_id in (SELECT client_id FROM event_assignation WHERE username = '"+str(session['name'])+"');"

    Query="SELECT * FROM event_leads"
    cur.execute(Query)
    row_headers=[x[0] for x in cur.description] #this will extract row headers
    rv = cur.fetchall()
    json_data=[]
    for result in rv:
        json_data.append(dict(zip(row_headers,result)))
    cur.close()
    conn.close()
    return ("{ \"data\" :" + (json.dumps(json_data , default=str)) + " } ")

@app.route('/delete_event',methods=["GET", "POST"])
def delete_event():
    """Delete one event, and the client with it if that was their last.

    Was: delete the whole lead by client_id, with the id concatenated straight
    into the SQL. Now an event is the unit, and the id is bound.
    """
    event_id = request.form.get('event_id') or request.form.get('client_id')
    try:
        event_id = int(event_id)
    except (TypeError, ValueError):
        return jsonify({'state': 'failed'})

    conn, cur = connection()
    try:
        if cur.execute("select role from user where username=%s", (session['name'],)) == 0:
            return jsonify({'state': 'failed'})
        (role,) = cur.fetchone()
        if role.lower() != 'admin':
            return jsonify({'state': 'no_access'})

        cur.execute("SELECT client_id FROM event_event WHERE event_id = %s", (event_id,))
        row = cur.fetchone()
        if row is None:
            return jsonify({'state': 'failed'})
        client_id = int(row[0])

        cur.execute("DELETE FROM event_check_list  WHERE event_id = %s", (event_id,))
        cur.execute("DELETE FROM event_assignation WHERE event_id = %s", (event_id,))
        cur.execute("DELETE FROM event_event       WHERE event_id = %s", (event_id,))

        # A client with no events left is not a lead any more.
        cur.execute("SELECT COUNT(*) FROM event_event WHERE client_id = %s", (client_id,))
        (remaining,) = cur.fetchone()
        if int(remaining) == 0:
            cur.execute("DELETE FROM event_client WHERE client_id = %s", (client_id,))

        conn.commit()
    finally:
        cur.close()
        conn.close()

    # The notes belong to the event, so they go with it.
    try:
        notes, mclient = get_event_mongo()
        notes.delete_many({'event_id': event_id})
        mclient.close()
    except Exception:
        pass

    return jsonify({'state': 'success', 'client_deleted': int(remaining) == 0})


@app.route('/historical_notification',methods=["GET", "POST"])
def historical_notification():
    return render_template("historical_notification.html")

@app.route('/get_american_lead_data',methods=["GET", "POST"])
def get_american_lead_data():

    conn, cur = connection()
    selection = request.args['selected_data']
    print
    match = re.match('^([0-9]+) - (.*) - (.*)$',selection)
    if match:
        student_id = match.group(1)
        student_mobile = match.group(2)
        student_name = match.group(3)
    print(student_id)
    Query="SELECT student_id,student_mobile,student_name,parent_mobile,gender,educational_system,exam_trial,subject,course,subject_id,exam_trial_id,school,email,source,status,CONVERT(recall_date,CHAR) as recall_date,not_interested_notes,deposit,added_date,added_by,modified_date,system_section,done,year,trial,maths,english,other,edu_system_id FROM american_leads where student_id="+str(student_id)
    cur.execute(Query)
    row_headers = [x[0] for x in cur.description]  # this will extract row headers

    rv = cur.fetchall()
    print(rv)
    json_data = []
    
    for result in rv:
        json_data.append(dict(zip(row_headers, result)))

    Query="SELECT username FROM assignation where student_id="+str(student_id)
    cur.execute(Query)
     # this will extract row headers

    rv = cur.fetchall()
    user_data = []
    for result in rv:
        user_data.append(result[0])
    users = [user_data]    # to response the list to the front-end because zip take first elemenet from first list and take the first element from the second list 

    json_data.append(dict(zip(['username_assignation'], users)))
    print(json_data)

    cur.close()
    conn.close()

    return (jsonify(json_data[0],json_data[1]))

@app.route('/get_american_notes',methods=["GET", "POST"])
def get_american_notes():
    student_id = request.args['id']  
    json_data=[]
    collection,client = get_american_mongo()
    for x in collection.find({"student_id":int(student_id)}).sort("added_date_standard",-1):
        x['_id']=(x['_id'])
        json_data.append(x)
    client.close()
    return ("{ \"data\" :" + json.dumps(json_data, default=str) + " } ")

@app.route('/get_events_notes',methods=["GET", "POST"])
def get_events_notes():
    # Notes hang off the event now. `id` stays accepted so nothing that still
    # passes a client id breaks, but event_id is what the page sends.
    event_id = request.args.get('event_id')
    if event_id:
        try:
            query = {"event_id": int(event_id)}
        except (TypeError, ValueError):
            return "{ \"data\" : [] }"
    else:
        try:
            query = {"client_id": int(request.args['id'])}
        except (TypeError, ValueError, KeyError):
            return "{ \"data\" : [] }"

    json_data = []
    collection, client = get_event_mongo()
    for x in collection.find(query).sort("added_date_standard", -1):
        x['_id']=(x['_id'])
        json_data.append(x)
    client.close()
    return ("{ \"data\" :" + json.dumps(json_data, default=str) + " } ")

@app.route('/get_educational_system_data',methods=["GET", "POST"])
def get_educational_system_data():

    conn, cur = connection()

    Query="SELECT * FROM educational_system;"
    cur.execute(Query)
    row_headers = [x[0] for x in cur.description]  # this will extract row headers

    rv = cur.fetchall()
    print(rv)
    json_data = []
    for result in rv:
        json_data.append(dict(zip(row_headers, result)))

    cur.close()
    conn.close()     
    
    #return ("{ \"data\" :" + (json.dumps(json_data , default=str)) + " } ")
    return json_data

@app.route('/get_subject_data',methods=["GET", "POST"])
def get_subject_data():

    conn, cur = connection()

    Query="SELECT * FROM subject"
    cur.execute(Query)
    row_headers = [x[0] for x in cur.description]  # this will extract row headers

    rv = cur.fetchall()
    
    json_data = []
    for result in rv:
        json_data.append(dict(zip(row_headers, result)))

    cur.close()
    conn.close()     
    
    #return ("{ \"data\" :" + (json.dumps(json_data , default=str)) + " } ")
    return json_data

@app.route('/get_exam_trial_data',methods=["GET", "POST"])
def get_exam_trial_data():

    conn, cur = connection()

    Query="SELECT * FROM exam_trial"
    cur.execute(Query)
    row_headers = [x[0] for x in cur.description]  # this will extract row headers

    rv = cur.fetchall()
    
    json_data = []
    for result in rv:
        json_data.append(dict(zip(row_headers, result)))

    cur.close()
    conn.close()     
    
    #return ("{ \"data\" :" + (json.dumps(json_data , default=str)) + " } ")
    return json_data

@app.route('/educational_system',methods=["GET", "POST"])
def educational_system():

    if request.method == 'POST' and 'add_educational_system' in request.args :
        educational_system = request.form['educational_system_name']
        educational_system = str(educational_system).upper()
        educational_system = str(educational_system).strip()
        print(educational_system)

        if educational_system == "":
            return jsonify({"state":"missing_fields"})

        conn, cur = connection()
        try:

            ### 1st Check that username is unique ###

            x=cur.execute("select educational_system from educational_system where educational_system=%s",(educational_system,))
            if int(x) > 0:
                cur.close()
                conn.close()
                return jsonify({"state":"duplicate"})

            cur.execute("INSERT INTO educational_system (educational_system) VALUES (%s);", (educational_system,))
            conn.commit()
            cur.close()
            conn.close()

            return jsonify({'state':'success'})

        except Exception as e:
            print(e)
            cur.close()
            conn.close()
            return jsonify({'state':'failed'})
            

    if request.method == 'POST' and 'delete_educational_system' in request.args :
        educational_system_id = request.form['educational_system_id']

        print(educational_system_id)

        try:
            conn,cur=connection()
            cur.execute("DELETE FROM user WHERE user_id = (%s)", (user_id,))
            conn.commit()
            cur.close()
            conn.close()

            return jsonify({'state':'success'})

        except Exception as e:
            print(e)
            cur.close()
            conn.close()
            return jsonify({'state':'failed'})


@app.route('/subject',methods=["GET", "POST"])
def subject():

    if request.method == 'POST' and 'add_subject' in request.args :
        subject = request.form['subject_name']
        subject = str(subject).strip()

        

        if subject == "":
            return jsonify({"state":"missing_fields"})

        conn, cur = connection()
        try:

            ### 1st Check that username is unique ###

            x=cur.execute("select subject from subject where lower(subject)=%s",(subject.lower(),))
            if int(x) > 0:
                cur.close()
                conn.close()
                return jsonify({"state":"duplicate"})

            cur.execute("INSERT INTO subject (subject) VALUES (%s);", (subject,))
            conn.commit()
            cur.close()
            conn.close()

            return jsonify({'state':'success'})

        except Exception as e:
            print(e)
            cur.close()
            conn.close()
            return jsonify({'state':'failed'})

@app.route('/course',methods=["GET", "POST"])
def course():

    if request.method == 'POST' and 'add_course' in request.args :
        subject = request.form['subject']
        exam_trial  = request.form['exam_trial']
        course_form = request.form['course1']
        
        subject = str(subject).strip()
        exam_trial = str(exam_trial).strip()
        course = subject + " - " + exam_trial
        if course_form != course:
            return jsonify({"state":"error","reason":"Error in choosing subject or exam trial"})
        

        if subject == "" or exam_trial == "" or subject == None or exam_trial == None:
            return jsonify({"state":"error","reason":"missing fields"})

        conn, cur = connection()
        try:

            ### 1st Check that username is unique ###
            
            x=cur.execute("select id from subject where lower(subject)=%s",(subject.lower(),))
            if int(x) == 0:
                cur.close()
                conn.close()
                return jsonify({"state":"error","reason":"subject deleted from db , kindly refresh"})
            elif int(x) == 1 :
                (subject_id,)=cur.fetchone()
            else:
                cur.close()
                conn.close()
                return jsonify({"state":"error","reason":"subject has duplicate value in DB, kindly delete one"})
            y=cur.execute("select id from exam_trial where lower(exam_trial)=%s",(exam_trial.lower(),))
            if int(y) == 0:
                cur.close()
                conn.close()
                return jsonify({"state":"error","reason":"Exam Trial deleted from db , kindly refresh"})
                
            elif int(y) == 1 :
                (exam_trial_id,)=cur.fetchone()
            else:
                cur.close()
                conn.close()
                return jsonify({"state":"error","reason":"Exam Trial has duplicate value in DB, kindly delete one"})
                
            if exam_trial_id and subject_id:
                t = cur.execute("select id from course where (subject_id=%s and exam_trial_id=%s) or lower(course)=%s",(subject_id,exam_trial_id,course.lower(),))
                if int(t)>0:
                    cur.close()
                    conn.close()
                    return jsonify({"state":"error","reason":"Course already added before to courses list"})
                else:
                    cur.execute("INSERT INTO course (course,subject,subject_id,exam_trial,exam_trial_id,added_by) VALUES (%s,%s,%s,%s,%s,%s);", (course,subject,subject_id,exam_trial,exam_trial_id,session['name'],))
                    conn.commit()
                    cur.close()
                    conn.close()

                    return jsonify({'state':'success','reason':'Course Added Successfully to list'})

        except Exception as e:
            
            cur.close()
            conn.close()
            return jsonify({'state':'failed'})

@app.route('/exam_trial',methods=["GET", "POST"])
def exam_trial():

    if request.method == 'POST' and 'add_exam_trial' in request.args :
        exam_trial = request.form['exam_trial_name']
        exam_trial = str(exam_trial).strip()

        

        if exam_trial == "":
            return jsonify({"state":"missing_fields"})

        conn, cur = connection()
        try:

            ### 1st Check that username is unique ###

            x=cur.execute("select exam_trial from exam_trial where lower(exam_trial)=%s",(exam_trial.lower(),))
            if int(x) > 0:
                cur.close()
                conn.close()
                return jsonify({"state":"duplicate"})

            cur.execute("INSERT INTO exam_trial (exam_trial) VALUES (%s);", (exam_trial,))
            conn.commit()
            cur.close()
            conn.close()

            return jsonify({'state':'success'})

        except Exception as e:
            print(e)
            cur.close()
            conn.close()
            return jsonify({'state':'failed'})

@app.route('/studentsDB',methods=["GET", "POST"])
def studentsDB():

    return render_template("studentsDB.html")

@app.route('/american_detailed_course_report',methods=["GET", "POST"])
def american_detailed_course_report():

    return render_template("american_detailed_course_report.html")

@app.route('/user_add_task',methods=["GET", "POST"])
def user_add_task():

    return render_template("user_add_task.html")

@app.route('/event_profile',methods=["GET", "POST"])
def event_profile():
    if  'username_profile' in request.args:
        username_profile = request.args['username_profile']
        if username_profile != session['name']:
            if session['role'] != 'admin':
                return 'Not Authorized'
        conn,cur=connection()
        x=cur.execute("select role from user where username=%s",(username_profile,))
        if int(x) ==0:
            return "Not Found"
        else:
            (username_role,) = cur.fetchone()

        # Counts are over events, since an event is the unit of work now.
        #
        # The non-admin versions also had a precedence bug: `where client_id in
        # (...) and status = 'pending' or status = 'not_contacted'` parses as
        # `(assigned AND pending) OR not_contacted`, so every not_contacted lead
        # in the system was counted no matter who it belonged to. Bracketed now.
        def count(where='', params=()):
            cur.execute("select ifnull(count(*),0) from event_event" + where, params)
            return cur.fetchone()[0]

        if username_role == 'admin':
            total_assigned_lead                = count()
            total_assigned_lead_unfinished     = count(" where status in ('pending','not_contacted')")
            total_assigned_lead_finished       = count(" where status = 'not_interested'")
            total_assigned_lead_finished_enrol = count(" where status = 'enrol'")
        else:
            mine = (" where event_id in (select event_id from event_assignation"
                    " where username=%s)")
            total_assigned_lead                = count(mine, (username_profile,))
            total_assigned_lead_unfinished     = count(
                mine + " and status in ('pending','not_contacted')", (username_profile,))
            total_assigned_lead_finished       = count(
                mine + " and status = 'not_interested'", (username_profile,))
            total_assigned_lead_finished_enrol = count(
                mine + " and status = 'enrol'", (username_profile,))

        cur.close()
        conn.close()
        return render_template("event_profile.html",username_profile=username_profile,total_assigned_lead=total_assigned_lead,total_assigned_lead_unfinished=total_assigned_lead_unfinished,total_assigned_lead_finished=total_assigned_lead_finished,total_assigned_lead_finished_enrol=total_assigned_lead_finished_enrol)
    else:
        return 'Profile not found'

@app.route('/profile',methods=["GET", "POST"])
def profile():
    if  'username_profile' in request.args:
        username_profile = request.args['username_profile']
        if username_profile != session['name']:
            if session['role'] != 'admin':
                return 'Not Authorized'
        conn,cur=connection()
        x=cur.execute("select role from user where username=%s",(username_profile,))
        if int(x) ==0:
            return "Not Found"
        else:
            (username_role,) = cur.fetchone()

        if username_role == 'admin':
            cur.execute("select count(*) as total_assigned_lead from american_leads ")
            (total_assigned_lead,)=cur.fetchone()

            cur.execute("select ifnull(count(*),0) as total_assigned_lead_unfinished from american_leads where status = 'pending' ")
            (total_assigned_lead_unfinished,)=cur.fetchone()

            cur.execute("select ifnull(count(*),0) as total_assigned_lead_finished from american_leads where status = 'not_interested' ")
            (total_assigned_lead_finished,)=cur.fetchone()

            cur.execute("select ifnull(count(*),0) as total_assigned_lead_finished_enrol from american_leads  where status = 'enrol' ")
            (total_assigned_lead_finished_enrol,)=cur.fetchone()
        else:

            cur.execute("select count(*) as total_assigned_lead from american_leads where student_id in ( select student_id from assignation where username=%s)",(username_profile,))
            (total_assigned_lead,)=cur.fetchone()

            cur.execute("select ifnull(count(*),0) as total_assigned_lead_unfinished from american_leads where student_id in ( select student_id from assignation where username=%s) and status = 'pending' ",(username_profile,))
            (total_assigned_lead_unfinished,)=cur.fetchone()

            cur.execute("select ifnull(count(*),0) as total_assigned_lead_finished from american_leads where student_id in ( select student_id from assignation where username=%s) and status = 'not_interested' ",(username_profile,))
            (total_assigned_lead_finished,)=cur.fetchone()

            cur.execute("select ifnull(count(*),0) as total_assigned_lead_finished_enrol from american_leads where student_id in ( select student_id from assignation where username=%s) and status = 'enrol' ",(username_profile,))
            (total_assigned_lead_finished_enrol,)=cur.fetchone()

        cur.close()
        conn.close()
        return render_template("profile.html",username_profile=username_profile,total_assigned_lead=total_assigned_lead,total_assigned_lead_unfinished=total_assigned_lead_unfinished,total_assigned_lead_finished=total_assigned_lead_finished,total_assigned_lead_finished_enrol=total_assigned_lead_finished_enrol)
    else:
        return 'Profile not found'

@app.route('/recall_date_table',methods=["GET", "POST"])
def recall_date_table():
    return render_template("recall_date_table.html")

@app.route('/recall_date_table_event',methods=["GET", "POST"])
def recall_date_table_event():
    return render_template("recall_date_table_event.html")

@app.route('/get_recall_date_event', methods=["GET","POST"])
def get_recall_date_event():
        date = request.args['date']
        conn, cur = connection()
        myrole = session['role']
        username=session['name']
        user_id = session['id']
        if myrole == 'admin':
            Query = ("select e.event_id, e.client_id, c.client_mobile, c.client_name,"
                     " e.event_name, if(e.done, 'yes', 'no') as done,"
                     " (select GROUP_CONCAT(username) from event_assignation"
                     "  where event_id = e.event_id) as assigned_username"
                     " from event_event as e"
                     " join event_client as c on c.client_id = e.client_id"
                     " where e.recall_date = %s")
            params = (date,)
        else:
            Query = ("select e.event_id, e.client_id, c.client_mobile, c.client_name,"
                     " e.event_name, if(e.done, 'yes', 'no') as done,"
                     " (select GROUP_CONCAT(username) from event_assignation"
                     "  where event_id = e.event_id) as assigned_username"
                     " from event_event as e"
                     " join event_client as c on c.client_id = e.client_id"
                     " where e.event_id in (select event_id from event_assignation"
                     "                      where user_id = %s)"
                     " and e.recall_date = %s")
            params = (user_id, date)

        cur.execute(Query, params)
        row_headers=[x[0] for x in cur.description] #this will extract row headers
        rv = cur.fetchall()
        json_data=[]
        for result in rv:
            json_data.append(dict(zip(row_headers,result)))
        cur.close()
        conn.close()
        return ("{ \"data\" :" + (json.dumps(json_data)) + " } ")

@app.route('/status_count')
def status_count():
        
        username_profile=request.args['username_profile']
        
        conn, cur=connection()
        cur.execute("select role from user where username=%s",(username_profile,))
        (username_role,)=cur.fetchone()

        y=cur.execute("select count(*) as status_count,status from american_leads where assigned_to=%s and paid_semester=false group by status order by status_count DESC",(username_profile,))

        #print("TESTTTTTTTTTTTTTTTTTTTTTT"+Query)
        row_headers = [x[0] for x in cur.description]  # this will extract row headers
        if int(y) == 0 :
           rv = (( 0,''),)
        else:
            rv = cur.fetchall()
        #print(rv)
        json_data = []
        for result in rv:
            json_data.append(dict(zip(row_headers, result)))
        cur.close()
        conn.close()     
        return (json.dumps(json_data))

@app.route('/edu_count')
def edu_count():
        
        username_profile=request.args['username_profile']
        
        conn, cur=connection()
        cur.execute("select role from user where username=%s",(username_profile,))
        (username_role,)=cur.fetchone()
        if username_role == 'admin':
            y=cur.execute("select count(*) as educational_system_count,educational_system from american_leads  group by educational_system order by educational_system_count DESC")
        else:
            y=cur.execute("select count(*) as educational_system_count,educational_system from american_leads where student_id in (select student_id from assignation where username=%s) group by educational_system order by educational_system_count DESC",(username_profile,))



        
        #print("TESTTTTTTTTTTTTTTTTTTTTTT"+Query)
        row_headers = [x[0] for x in cur.description]  # this will extract row headers
        if int(y) == 0 :
           rv = (( 0,''),)
        else:
            rv = cur.fetchall()
        #print(rv)
        json_data = []
        for result in rv:
            json_data.append(dict(zip(row_headers, result)))
        cur.close()
        conn.close()     
        return (json.dumps(json_data))

@app.route('/course_analysis')
def course_analysis():
        
        username_profile=request.args['username_profile']
        
        conn, cur=connection()
        cur.execute("select role from user where username=%s",(username_profile,))
        (username_role,)=cur.fetchone()
        if username_role == 'admin':
        
            y=cur.execute("select count(*) as course_count,course from course_status where status = 'enrol' group by course")
        else:
            y=cur.execute("select count(*) as course_count,course from course_status where status = 'enrol' and student_id in (select student_id from american_leads where student_id in (select student_id from assignation where username=%s)) group by course",(username_profile,))

        
        #print("TESTTTTTTTTTTTTTTTTTTTTTT"+Query)
        row_headers = [x[0] for x in cur.description]  # this will extract row headers
        if int(y) == 0 :
           rv = (( 0,''),)
        else:
            rv = cur.fetchall()
        #print(rv)
        json_data = []
        for result in rv:
            json_data.append(dict(zip(row_headers, result)))
        cur.close()
        conn.close()     
        return (json.dumps(json_data))

@app.route('/course_analysis2')
def course_analysis2():
        
        username_profile=request.args['username_profile']
        
        conn, cur=connection()
        cur.execute("select role from user where username=%s",(username_profile,))
        (username_role,)=cur.fetchone()
        if username_role == 'admin':
            y=cur.execute("select count(*) as course_count,course from course_status where status = 'pending' group by course")
        else:
            y=cur.execute("select count(*) as course_count,course from course_status where status = 'pending' and student_id in (select student_id from american_leads where student_id in (select student_id from assignation where username=%s)) group by course",(username_profile,))

        
        #print("TESTTTTTTTTTTTTTTTTTTTTTT"+Query)
        row_headers = [x[0] for x in cur.description]  # this will extract row headers
        if int(y) == 0 :
           rv = (( 0,''),)
        else:
            rv = cur.fetchall()
        #print(rv)
        json_data = []
        for result in rv:
            json_data.append(dict(zip(row_headers, result)))
        cur.close()
        conn.close()     
        return (json.dumps(json_data))

@app.route('/course_analysis3')
def course_analysis3():
        
        username_profile=request.args['username_profile']
        
        conn, cur=connection()
        cur.execute("select role from user where username=%s",(username_profile,))
        (username_role,)=cur.fetchone()
        if username_role == 'admin':
            y=cur.execute("select count(*) as course_count,course from course_status where status = 'not_interested' group by course")
        else:
            y=cur.execute("select count(*) as course_count,course from course_status where status = 'not_interested' and student_id in (select student_id from american_leads where student_id in (select student_id from assignation where username=%s)) group by course",(username_profile,))

        
        #print("TESTTTTTTTTTTTTTTTTTTTTTT"+Query)
        row_headers = [x[0] for x in cur.description]  # this will extract row headers
        if int(y) == 0 :
           rv = (( 0,''),)
        else:
            rv = cur.fetchall()
        #print(rv)
        json_data = []
        for result in rv:
            json_data.append(dict(zip(row_headers, result)))
        cur.close()
        conn.close()     
        return (json.dumps(json_data))

@app.route('/course_analysis1')
def course_analysis1():
        
        username_profile=request.args['username_profile']
        
        conn, cur=connection()
        cur.execute("select role from user where username=%s",(username_profile,))
        (username_role,)=cur.fetchone()
        if username_role == 'admin':
            y=cur.execute("select count(*) as course_count,status from course_status  group by status")
        else:
            y=cur.execute("select count(*) as course_count,status from course_status where student_id in (select student_id from american_leads where student_id in (select student_id from assignation where username=%s)) group by status",(username_profile,))

        
        #print("TESTTTTTTTTTTTTTTTTTTTTTT"+Query)
        row_headers = [x[0] for x in cur.description]  # this will extract row headers
        if int(y) == 0 :
           rv = (( 0,''),)
        else:
            rv = cur.fetchall()
        #print(rv)
        json_data = []
        for result in rv:
            json_data.append(dict(zip(row_headers, result)))
        cur.close()
        conn.close()     
        return (json.dumps(json_data))


# =============================================================================
# Event profile charts.
#
# The panel on event_profile.html was carrying the five education charts,
# hidden. They query american_leads, assignation and course_status - education
# tables - so on an event user's profile they were the wrong numbers, and
# `hidden` was a blunt way of saying so. These are the event equivalents.
#
# One endpoint rather than four near-identical ones. The dimension is an
# allowlist key, never interpolated user input, and it maps to a column and a
# label rather than being pasted into SQL.
#
# Money is deliberately not charted: SUM(client_total) does not reconcile with
# SUM(client_deposit) + SUM(client_remaining) in the data as it stands, so a
# revenue chart would render numbers that contradict each other.
# =============================================================================

EVENT_CHART_DIMENSIONS = {
    'status':      ('status',         'Event status'),
    'payment':     ('payment_status', 'Payment status'),
    'temperature': ('temperature',    'Temperature'),
    'deposit':     ('deposit_flag',   'Deposit taken'),
}

# The deposit column is a flag, so it needs labels rather than 0 and 1.
DEPOSIT_LABELS = {0: 'No deposit', 1: 'Deposit taken'}


@app.route('/api/event_profile_chart')
def event_profile_chart():
    username_profile = request.args.get('username_profile', '')
    dimension        = request.args.get('dim', '')

    if dimension not in EVENT_CHART_DIMENSIONS:
        return json.dumps({'error': 'unknown dimension'}), 400

    # The page itself checks this; the education chart endpoints never did, so
    # any signed-in user could read any other user's figures by changing the
    # query string. Same check here.
    if username_profile != session.get('name') and session.get('role') != 'admin':
        return json.dumps({'error': 'not authorised'}), 403

    column, label = EVENT_CHART_DIMENSIONS[dimension]

    conn, cur = connection()
    try:
        cur.execute("select role from user where username=%s", (username_profile,))
        row = cur.fetchone()
        if row is None:
            return json.dumps({'error': 'no such user'}), 404
        (username_role,) = row

        # Column name comes from the allowlist above, never from the request.
        select = ("select count(*) as lead_count, %s as bucket from event_event" % column)
        if username_role == 'admin':
            cur.execute(select + " group by bucket order by lead_count desc")
        else:
            cur.execute(
                select + " where event_id in"
                         " (select event_id from event_assignation where username=%s)"
                         " group by bucket order by lead_count desc",
                (username_profile,))

        rows = cur.fetchall()
    finally:
        cur.close()
        conn.close()

    out = []
    for count, bucket in rows:
        if dimension == 'deposit':
            name = DEPOSIT_LABELS.get(bucket, 'Unknown')
        else:
            name = (bucket or '').replace('_', ' ').strip().capitalize() or 'Unspecified'
        out.append({'bucket': name, 'lead_count': int(count)})

    return json.dumps({'title': label, 'data': out})


# =============================================================================
# The event client page.
#
# One request returns the client and every event they have booked, each with its
# own checklist and assignation. The page used to fetch a single lead, because a
# lead was a client and an event welded together.
# =============================================================================

@app.route('/api/event_client')
def api_event_client():
    if 'name' not in session:
        return jsonify({'error': 'not_authenticated'}), 401
    try:
        client_id = int(request.args.get('client_id', ''))
    except (TypeError, ValueError):
        return jsonify({'error': 'bad_client_id'}), 400

    conn, cur = connection()
    try:
        cur.execute(
            "SELECT client_id, client_name, client_mobile, client_email,"
            " CONVERT(added_date, CHAR) AS added_date, added_by,"
            " CONVERT(modified_date, CHAR) AS modified_date, modified_by"
            " FROM event_client WHERE client_id = %s", (client_id,))
        row = cur.fetchone()
        if row is None:
            return jsonify({'error': 'not_found'}), 404
        heads = [d[0] for d in cur.description]
        client = dict(zip(heads, row))

        cur.execute(
            "SELECT event_id, client_id, event_name, status, temperature,"
            " CONVERT(recall_date, CHAR) AS recall_date, not_interested_notes,"
            " payment_status, deposit_flag, deposit, total, remaining,"
            " assets_list, done, file_name,"
            " CONVERT(added_date, CHAR) AS added_date, added_by,"
            " CONVERT(modified_date, CHAR) AS modified_date, modified_by"
            # Newest first: the event someone is working on is almost always
            # the one just booked, not the one from two years ago.
            " FROM event_event WHERE client_id = %s ORDER BY event_id DESC", (client_id,))
        heads = [d[0] for d in cur.description]
        events = [dict(zip(heads, r)) for r in cur.fetchall()]

        if events:
            ids = tuple(e['event_id'] for e in events)
            marks = ','.join(['%s'] * len(ids))

            cur.execute("SELECT event_id, item, checked FROM event_check_list"
                        " WHERE event_id IN (%s) ORDER BY id" % marks, ids)
            checks = {}
            for ev, item, checked in cur.fetchall():
                checks.setdefault(int(ev), []).append({'item': item, 'checked': int(checked)})

            cur.execute("SELECT event_id, username FROM event_assignation"
                        " WHERE event_id IN (%s)" % marks, ids)
            assigned = {}
            for ev, username in cur.fetchall():
                assigned.setdefault(int(ev), []).append(username)

            for e in events:
                e['check_list']  = checks.get(int(e['event_id']), [])
                e['assigned_to'] = assigned.get(int(e['event_id']), [])
    finally:
        cur.close()
        conn.close()

    return app.response_class(
        json.dumps({'client': client, 'events': events}, default=str),
        mimetype='application/json')


# =============================================================================
# Auto-save.
#
# A change saves itself the moment it is made, so there is no Save button to
# forget. Every change is recorded in event_revision with what the value was
# and what it became, which is both the audit trail that the required note used
# to provide and what Undo steps back through.
#
# Only the fields below can be written, and each is mapped to its column - the
# field name from the request never reaches the SQL.
# =============================================================================

EVENT_FIELDS = {
    'event_name':           'event_name',
    'status':               'status',
    'temperature':          'temperature',
    'recall_date':          'recall_date',
    'not_interested_notes': 'not_interested_notes',
    'payment_status':       'payment_status',
    'deposit_flag':         'deposit_flag',
    'deposit':              'deposit',
    'total':                'total',
    'remaining':            'remaining',
    'assets_list':          'assets_list',
    'done':                 'done',
}

CLIENT_FIELDS = {
    'client_name':   'client_name',
    'client_mobile': 'client_mobile',
    'client_email':  'client_email',
}

# Two things that are a set rather than a value. They are stored as their own
# rows, so they are read and written whole and their revision holds JSON.
SET_FIELDS = ('check_list', 'assigned_to')

# Empty means "no date", not the string "".
NULLABLE = ('recall_date',)


def _read_check_list(cur, event_id):
    cur.execute("SELECT item, checked FROM event_check_list WHERE event_id=%s ORDER BY id",
                (event_id,))
    return [{'item': i, 'checked': int(c)} for i, c in cur.fetchall()]


def _read_assigned(cur, event_id):
    cur.execute("SELECT username FROM event_assignation WHERE event_id=%s ORDER BY username",
                (event_id,))
    return [r[0] for r in cur.fetchall()]


def _write_check_list(cur, client_id, event_id, items):
    cur.execute("DELETE FROM event_check_list WHERE event_id=%s", (event_id,))
    for it in items:
        cur.execute("INSERT INTO event_check_list (client_id, event_id, item, checked)"
                    " VALUES (%s,%s,%s,%s)",
                    (client_id, event_id, it.get('item', '')[:40],
                     1 if it.get('checked') else 0))


def _write_assigned(cur, client_id, event_id, usernames, client_mobile):
    cur.execute("SELECT username FROM event_assignation WHERE event_id=%s", (event_id,))
    already = {r[0] for r in cur.fetchall()}
    for username in usernames:
        if username in already:
            continue
        cur.execute("SELECT user_id FROM user WHERE username=%s", (username,))
        u = cur.fetchone()
        cur.execute("INSERT INTO event_assignation (client_id, event_id, user_id, username,"
                    " client_mobile) VALUES (%s,%s,%s,%s,%s)",
                    (client_id, event_id, int(u[0]) if u else None, username, client_mobile))
    for username in already - set(usernames):
        cur.execute("DELETE FROM event_assignation WHERE event_id=%s AND username=%s",
                    (event_id, username))


def _record(cur, client_id, event_id, field, old, new):
    cur.execute("INSERT INTO event_revision (event_id, client_id, field, old_value,"
                " new_value, changed_by, changed_at) VALUES (%s,%s,%s,%s,%s,%s,NOW())",
                (event_id, client_id, field,
                 None if old is None else str(old),
                 None if new is None else str(new),
                 session['name']))


def _apply(cur, client_id, event_id, field, value):
    """Write one field and return (old, new) as they were stored."""
    if field in SET_FIELDS:
        try:
            parsed = json.loads(value) if isinstance(value, str) else value
        except ValueError:
            raise ValueError('bad value')
        if field == 'check_list':
            old = _read_check_list(cur, event_id)
            _write_check_list(cur, client_id, event_id, parsed or [])
            return json.dumps(old), json.dumps(parsed or [])
        old = _read_assigned(cur, event_id)
        cur.execute("SELECT client_mobile FROM event_client WHERE client_id=%s", (client_id,))
        row = cur.fetchone()
        _write_assigned(cur, client_id, event_id, parsed or [], row[0] if row else '')
        return json.dumps(old), json.dumps(sorted(parsed or []))

    if field in CLIENT_FIELDS:
        column = CLIENT_FIELDS[field]
        cur.execute("SELECT `%s` FROM event_client WHERE client_id=%%s" % column, (client_id,))
        row = cur.fetchone()
        old = None if row is None else row[0]
        cur.execute("UPDATE event_client SET `%s`=%%s, modified_date=NOW(), modified_by=%%s"
                    " WHERE client_id=%%s" % column, (value, session['name'], client_id))
        return old, value

    column = EVENT_FIELDS[field]
    if field in NULLABLE and (value is None or str(value).strip() == ''):
        value = None
    cur.execute("SELECT `%s` FROM event_event WHERE event_id=%%s" % column, (event_id,))
    row = cur.fetchone()
    old = None if row is None else row[0]
    cur.execute("UPDATE event_event SET `%s`=%%s, modified_date=NOW(), modified_by=%%s"
                " WHERE event_id=%%s" % column, (value, session['name'], event_id))
    return old, value


@app.route('/api/event_field', methods=["POST"])
def api_event_field():
    if 'name' not in session:
        return jsonify({'error': 'not_authenticated'}), 401

    field = request.form.get('field', '')
    if field not in EVENT_FIELDS and field not in CLIENT_FIELDS and field not in SET_FIELDS:
        return jsonify({'state': 'failed', 'reason': 'unknown field'}), 400

    try:
        client_id = int(request.form['client_id'])
        event_id  = int(request.form['event_id']) if request.form.get('event_id') else None
    except (KeyError, TypeError, ValueError):
        return jsonify({'state': 'failed', 'reason': 'bad ids'}), 400

    if event_id is None and field not in CLIENT_FIELDS:
        return jsonify({'state': 'failed', 'reason': 'event required'}), 400

    conn, cur = connection()
    try:
        if event_id is not None:
            cur.execute("SELECT client_id FROM event_event WHERE event_id=%s", (event_id,))
            row = cur.fetchone()
            if row is None or int(row[0]) != client_id:
                return jsonify({'state': 'failed', 'reason': 'wrong event'}), 400

        old, new = _apply(cur, client_id, event_id, field, request.form.get('value', ''))

        # Nothing changed, so nothing worth recording or undoing.
        if str(old) == str(new):
            conn.commit()
            return jsonify({'state': 'unchanged'})

        _record(cur, client_id, event_id, field, old, new)
        conn.commit()
    except ValueError:
        conn.rollback()
        return jsonify({'state': 'failed', 'reason': 'bad value'}), 400
    except Exception:
        conn.rollback()
        app.logger.exception('event_field failed')
        return jsonify({'state': 'failed', 'reason': 'not saved'}), 500
    finally:
        cur.close()
        conn.close()

    return app.response_class(json.dumps({'state': 'success', 'field': field,
                                          'old': old, 'new': new}, default=str),
                              mimetype='application/json')


@app.route('/api/event_undo', methods=["POST"])
def api_event_undo():
    """Step back the most recent change that has not already been stepped back."""
    if 'name' not in session:
        return jsonify({'error': 'not_authenticated'}), 401
    try:
        client_id = int(request.form['client_id'])
        event_id  = int(request.form['event_id']) if request.form.get('event_id') else None
    except (KeyError, TypeError, ValueError):
        return jsonify({'state': 'failed'}), 400

    conn, cur = connection()
    try:
        if event_id is not None:
            cur.execute("SELECT id, field, old_value FROM event_revision"
                        " WHERE undone = 0 AND (event_id = %s OR"
                        "       (event_id IS NULL AND client_id = %s))"
                        " ORDER BY id DESC LIMIT 1", (event_id, client_id))
        else:
            cur.execute("SELECT id, field, old_value FROM event_revision"
                        " WHERE undone = 0 AND client_id = %s"
                        " ORDER BY id DESC LIMIT 1", (client_id,))
        row = cur.fetchone()
        if row is None:
            return jsonify({'state': 'nothing_to_undo'})

        rev_id, field, old_value = row

        # Restoring is just another write, but it is not recorded as a fresh
        # change - the revision it reverses is marked instead, so undoing twice
        # steps back two changes rather than ping-ponging on one.
        _apply(cur, client_id, event_id, field, old_value)
        cur.execute("UPDATE event_revision SET undone = 1 WHERE id = %s", (rev_id,))
        conn.commit()
    except Exception:
        conn.rollback()
        app.logger.exception('event_undo failed')
        return jsonify({'state': 'failed'}), 500
    finally:
        cur.close()
        conn.close()

    return jsonify({'state': 'success', 'field': field})


@app.route('/api/event_history')
def api_event_history():
    if 'name' not in session:
        return jsonify({'error': 'not_authenticated'}), 401
    try:
        client_id = int(request.args['client_id'])
        event_id  = int(request.args['event_id']) if request.args.get('event_id') else None
    except (KeyError, TypeError, ValueError):
        return jsonify({'error': 'bad ids'}), 400

    conn, cur = connection()
    try:
        cur.execute("SELECT id, field, old_value, new_value, changed_by,"
                    " CONVERT(changed_at, CHAR) AS changed_at, undone"
                    " FROM event_revision"
                    " WHERE (event_id = %s OR (event_id IS NULL AND client_id = %s))"
                    " ORDER BY id DESC LIMIT 50", (event_id, client_id))
        heads = [d[0] for d in cur.description]
        rows = [dict(zip(heads, r)) for r in cur.fetchall()]
    finally:
        cur.close()
        conn.close()

    return app.response_class(json.dumps({'data': rows}, default=str),
                              mimetype='application/json')


@app.route('/api/event_note', methods=["POST"])
def api_event_note():
    """A note is now something someone chooses to write, not a toll on saving."""
    if 'name' not in session:
        return jsonify({'error': 'not_authenticated'}), 401
    note = (request.form.get('notes') or '').strip()
    if not note:
        return jsonify({'state': 'failed', 'reason': 'empty note'}), 400
    try:
        client_id = int(request.form['client_id'])
        event_id  = int(request.form['event_id'])
    except (KeyError, TypeError, ValueError):
        return jsonify({'state': 'failed'}), 400

    conn, cur = connection()
    try:
        cur.execute("SELECT c.client_mobile FROM event_client c"
                    " JOIN event_event e ON e.client_id = c.client_id"
                    " WHERE e.event_id = %s AND c.client_id = %s", (event_id, client_id))
        row = cur.fetchone()
        if row is None:
            return jsonify({'state': 'failed', 'reason': 'wrong event'}), 400
        mobile = row[0]
    finally:
        cur.close()
        conn.close()

    add_event_notes(client_id, mobile, note, event_id)
    return jsonify({'state': 'success'})


@app.route('/api/event_add', methods=["POST"])
def api_event_add():
    """Add another event to a client. Named for them, or numbered if not."""
    if 'name' not in session:
        return jsonify({'error': 'not_authenticated'}), 401
    try:
        client_id = int(request.form.get('client_id', ''))
    except (TypeError, ValueError):
        return jsonify({'state': 'failed'}), 400

    name = (request.form.get('event_name') or '').strip()

    conn, cur = connection()
    try:
        cur.execute("SELECT COUNT(*) FROM event_client WHERE client_id = %s", (client_id,))
        if int(cur.fetchone()[0]) == 0:
            return jsonify({'state': 'failed', 'reason': 'no such client'}), 404

        if not name:
            cur.execute("SELECT COUNT(*) FROM event_event WHERE client_id = %s", (client_id,))
            name = 'Event %d' % (int(cur.fetchone()[0]) + 1)

        cur.execute(
            "INSERT INTO event_event (client_id, event_name, status, temperature,"
            " payment_status, deposit_flag, deposit, total, remaining, done,"
            " added_date, added_by)"
            " VALUES (%s, %s, 'not_contacted', 'hot', 'pending', 0, 0, 0, 0, 0, NOW(), %s)",
            (client_id, name[:128], session['name']))
        event_id = cur.lastrowid
        conn.commit()
    finally:
        cur.close()
        conn.close()

    return jsonify({'state': 'success', 'event_id': event_id, 'event_name': name})


@app.route('/api/event_rename', methods=["POST"])
def api_event_rename():
    if 'name' not in session:
        return jsonify({'error': 'not_authenticated'}), 401
    try:
        event_id = int(request.form.get('event_id', ''))
    except (TypeError, ValueError):
        return jsonify({'state': 'failed'}), 400
    name = (request.form.get('event_name') or '').strip()
    if not name:
        return jsonify({'state': 'failed', 'reason': 'name required'}), 400

    conn, cur = connection()
    try:
        cur.execute("UPDATE event_event SET event_name = %s, modified_date = NOW(),"
                    " modified_by = %s WHERE event_id = %s",
                    (name[:128], session['name'], event_id))
        conn.commit()
    finally:
        cur.close()
        conn.close()
    return jsonify({'state': 'success', 'event_name': name[:128]})


@app.route('/get_recall_date', methods=["GET","POST"])
def get_recall_date():
        date = request.args['date']
        conn, cur = connection()
        myrole = session['role']
        username=session['name']
        user_id = session['id']
        if myrole == 'admin':
            Query= "select student_id,student_mobile,student_name,done,(select GROUP_CONCAT(username)  from assignation where a.student_id=student_id) as assigned_username from american_leads as a where  recall_date = '"+date+"'"
        else:
            Query= "select student_id,student_mobile,student_name,done,(select GROUP_CONCAT(username)  from assignation where a.student_id=student_id) as assigned_username from american_leads as a where student_id in (select student_id from assignation where user_id="+str(user_id)+") and  recall_date = '"+date+"'"

        cur.execute(Query)
        row_headers=[x[0] for x in cur.description] #this will extract row headers
        rv = cur.fetchall()
        json_data=[]
        for result in rv:
            json_data.append(dict(zip(row_headers,result)))
        cur.close()
        conn.close()
        return ("{ \"data\" :" + (json.dumps(json_data)) + " } ")


@app.route('/add_notes_recall', methods=["GET","POST"])
def add_notes_recall():
    if request.method == 'POST':
        student_id =request.form['student_id']
        notes =request.form['notes']
        student_mobile = request.form['student_mobile']
        feedback=add_notes(student_id,student_mobile,notes)
        return jsonify({"state":"success","reason":"Notes Added Successfully"})

@app.route('/add_reply', methods=["GET","POST"])
def add_reply():
    collection,client = get_reply_mongo()
    try:
        date_now_mongo = datetime.datetime.now()
        notification_id =request.form['notification_id']
        reply =request.form['reply']
        added_datetime_standard_mongo = date_now_mongo.strftime("%Y-%m-%d %H:%M:%S")
        added_datetime_mongo = date_now_mongo.strftime("%Y-%m-%d %I:%M %p")
        collection.insert_one({"notification_id":notification_id,"reply":reply,"added_date":added_datetime_mongo,'added_date_standard':added_datetime_standard_mongo,"added_by":session['name'],})
        client.close()
        return jsonify({"state":"success","reason":"reply added successfully"})
    except:
        client.close()
        return jsonify({"state":"error","reason":"reply not added"})

@app.route('/add_notes_recall_event', methods=["GET","POST"])
def add_notes_recall_event():
    if request.method == 'POST':
        client_id =request.form['client_id']
        notes =request.form['notes']
        client_mobile = request.form['client_mobile']
        feedback=add_notes(client_id,client_mobile,notes)
        return jsonify({"state":"success","reason":"Event Notes Added Successfully"})

@app.route('/add_to_do', methods=["GET","POST"])
def add_to_do():
    if request.method == 'POST':
        user_id =request.form['user_id']
        username = request.form['username']
        to_do =request.form['to_do']
        collection,client = get_notification_mongo()
        date_now_mongo = datetime.datetime.now()
        added_datetime_standard_mongo = date_now_mongo.strftime("%Y-%m-%d %H:%M:%S")
        added_datetime_mongo = date_now_mongo.strftime("%Y-%m-%d %I:%M %p")
        collection.insert_one({"username":username,"user_id":int(user_id),"title":"New Task Added","message":to_do,"added_by":session['name'],"added_date":added_datetime_standard_mongo,"student_id":"Task","section":"To Do List","read":False,"student_mobile":""})
        client.close()
        return jsonify({"state":"success","reason":"Task Added Successfully"})
       

        
@app.route('/delete_student',methods=["GET", "POST"])
def delete_student():
    student_id = request.form['student_id']

    conn, cur = connection()
    try:
        x=cur.execute("select role from user where username=%s",(session['name'],))
        if int(x) == 0:
            return jsonify({'state':'failed'})
        else:
            (role,)=cur.fetchone()
            if role.lower() == 'admin':
                Query="DELETE FROM american_leads WHERE student_id = "+str(student_id)+";"
                cur.execute(Query)
                cur.execute("DELETE FROM course_status WHERE student_id = %s",(student_id,))
                cur.execute("DELETE FROM assignation WHERE student_id = %s",(student_id,))
                conn.commit()



                cur.close()
                conn.close()

                return jsonify({'state':'success'})
            else:
                cur.close()
                conn.close()

                return jsonify({'state':'no_access'})

    except Exception as e:
        print(e)
        cur.close()
        conn.close()
        return jsonify({'state':'failed'})
### STUDENTS DB ###


###### CRM EXCEL SHEET START ######

@app.route('/crm_excel_sheet', methods=['GET', 'POST'])
def crm_excel_sheet():

    if request.method =="POST" and "upload" in request.args:
        files = request.files.getlist('files[]')
        
        #print(files[0].filename)
        date = request.form['date']
        date_now = datetime.datetime.now()
        file_date = date_now.strftime("%Y%m%d%H%M%S")
        #date="2021-03-16"
        
        #print(filename)
        try:
            file_extension = re.search('(\..+?)$', files[0].filename).group(1)
        except AttributeError:
            # Extension not found in the original string
            file_extension = '' # apply your error handling

        #print(file_extension)

        for file in files:
            #print("Current file: "+str(file.filename))
            if file.filename != '':
                #print(file.name)
                #filename = secure_filename(file.filename)

                filename = file.filename+"_"+file_date
                file_name = filename+file_extension
                path = '/projects/51_apps/51_american_crm_nginx_clone/static/crm_excel_files'
            
                try:
                    file.save(path+'/'+file_name) ## Save File
                except:
                    return jsonify({"state":"error","reason":"Failed to Save File"})

                
                    ## Convert xls to csv
                excel_full_path = path+'/'+file_name
                df = pd.read_excel( excel_full_path, engine='openpyxl',sheet_name = 'Sheet1',dtype={'Status':str})
                
                try:
                    print(df['user_id'].empty)
                    if  df['user_id'].empty:
                        raise Exception("User ID Column not found")
                    if df['Student Name'].isnull().values.any():
                            raise Exception("Empty Data Detected in 'Student Name' Column")
                    elif df['Mobile No.'].isnull().values.any():
                            raise Exception("Empty Data Detected in 'Student Mobile' Column")
                    elif df['Year'].isnull().values.any():
                            raise Exception("Empty Data Detected in 'Year' Column")
                    elif df['School Name'].isnull().values.any():
                            raise Exception("Empty Data Detected in 'School' Column")
                    elif df['Education'].isnull().values.any():
                            raise Exception("Empty Data Detected in 'Education' Column")
                    elif df['Status'].isnull().values.any():
                            raise Exception("Empty Data Detected in 'Status' Column")
                    elif df['user_id'].isnull().values.any():
                            raise Exception("Empty Data Detected in 'User ID' Column")
                    else:
                        student_Name_list = df['Student Name'].tolist()
                        student_mobile_list = df['Mobile No.'].tolist()
                        parent_mobile_list = df['Parent No.'].fillna(" ").tolist()
                        year_list = df['Year'].tolist()
                        school_list = df['School Name'].tolist()
                        educational_system_list = df['Education'].tolist()
                        status_list = df['Status'].tolist()
                        user_id_list = df['user_id'].tolist()
                        english_list = df['English'].replace(np.nan, None).tolist()
                        deposit_list = df['Deposit'].replace(np.nan, None).tolist()
                        
                except Exception as e:
                        print(e)
                        exception_type, exception_object, exception_traceback = sys.exc_info()

                        filename = exception_traceback.tb_frame.f_code.co_filename

                        line_number = exception_traceback.tb_lineno
                        print(line_number)
                        path = '/projects/51_apps/51_american_crm_nginx_clone/static/crm_excel_files'
                        os.remove(os.path.join(path,file_name))
                        return jsonify({"state":"error","reason":str(e)})


                try:
                    column_length = len(student_mobile_list)
                    conn,cur=connection()
                    user_id_db={}
                    y=cur.execute("select user_id,username from user")
                    if int(y) == 0:
                        cur.close()
                        conn.close()
                        return jsonify({"state":"error","reason":"There is no user added in users DB .. add users first" })
                    else:
                        user_record = cur.fetchall()
                        for users_rec in user_record:
                            user_id_db[users_rec[0]] = users_rec[1]
                    success_count = 0
                    failed_count = 0
                    for index in range(0,column_length):
                        student_name=student_Name_list[index]
                        student_mobile=int(student_mobile_list[index])
                        x=cur.execute("select student_id from students where student_mobile=%s",(student_mobile,))
                        if int(x) > 0:
                            failed_count+=1
                            continue
                        parent_mobile=parent_mobile_list[index]
                        user_id=user_id_list[index]
                        username_assign = user_id_db[user_id]
                        year=year_list[index]
                        school=school_list[index]
                        educational_system=educational_system_list[index]
                        if re.search("igcse",educational_system.lower()) or educational_system.lower()== 'ig':
                            educational_system = 'IGCSE, GCSE'
                        elif re.search("thanwyia",educational_system.lower()) or re.search("amma",educational_system.lower()) :
                            educational_system='Thanwyia Amma'
                        elif re.search("american",educational_system.lower()):
                            educational_system='American Diploma'
                        elif re.search("international bac",educational_system.lower()) or educational_system.lower() =='ib' or educational_system.lower() == 'bac':
                            educational_system='International Baccalaureate (IB)'
                        elif re.search("candian",educational_system.lower()):
                            educational_system='Candian Certificate'
                        elif re.search("french",educational_system.lower()):
                            educational_system='French Baccalaureate'
                        elif re.search("german",educational_system.lower()):
                            educational_system='The German Secondary School Certificate - Abitur'
                        elif re.search("transfer",educational_system.lower()):
                            educational_system='Transfer'
                        #Transfer

                        status=status_list[index]
                        if status.lower() == 'interested':
                            status = 'Interested'
                        elif status.lower() == 'na' or status.lower() == 'n/a' or status.lower() == 'not applicable' :
                            status = 'N/A'
                        elif status.lower() == 'not contacted'  :
                            status = 'Not Contacted'
                        elif status.lower() == 'wrong number'  :
                            status = 'Wrong Number'
                        elif status.lower() == 'not interested' :
                            status = 'Not Interested'
                        english=str(english_list[index])
                        
                        if english.lower() == 'yes':
                            english="1"
                        elif english.lower() == 'no':
                            english="0"
                        else:
                            english=None
                        deposit=str(deposit_list[index])
                        if deposit.lower() == 'yes':
                            deposit="1"
                        elif deposit.lower() == 'no':
                            deposit="0"
                        else:
                            deposit=None
                        feedback = creating_lead(student_mobile,student_name,parent_mobile,"",year,educational_system,school,"","","",status,None,english,None,"",deposit,session['name'],"Added From Excel","Excel",username_assign,"0","0")
                        if feedback['state'] == 'error':
                                failed_count+=1
                                continue
                                
                        else:
                                success_count +=1
 
                    cur.close()
                    conn.close()
                    return jsonify({"state":"success","reason":str(success_count)+" Leads Added Successfully  & "+str(failed_count)+" failed due to repetitive mobile number "})
                except Exception as e:
                    print(e)

                    path = '/projects/51_apps/51_american_crm_nginx_clone/static/crm_excel_files'
                    os.remove(os.path.join(path,file_name))
                    
                    return jsonify({"state":"error","reason":"Failed to insert data Due: " + str(e) })
    
        return "Success"

    if request.method =="POST" and "delete" in request.args:
        filename = request.form['filename']

        print("deleting: "+filename)

        try:
            path = '/projects/51_apps/51_american_crm_nginx_clone/static/crm_excel_files'
            os.remove(os.path.join(path,filename))
            return "Success"

        except:
            return "Failed"

    return render_template("crm_excel_sheet.html")

@app.route('/crm_excel_sheet_getFiles', methods=['GET', 'POST'])
def hr_attendance_sheet_getFiles():

    path = '/projects/51_apps/51_american_crm_nginx_clone/static/crm_excel_files'
    ## get files' names

    try:
        lst = os.listdir(path)
        print (lst)

    except OSError:
        pass #ignore errors
    else:
        json_data=[]
        for name in lst:
            json_data.append({'file':name})
        
    return ("{ \"data\" :" + (json.dumps(json_data)) + " } ")


###### CRM EXCEL SHEET END ########


###### CRM DBs #########

@app.route('/american_db', methods=["GET","POST"])
def american_db():
    return render_template("american_db.html")

@app.route('/get_all_american_lead_data',methods=["GET", "POST"])
def get_all_american_lead_data():

    conn, cur = connection()

    if session['role'] == 'admin':
        Query="SELECT * FROM american_leads"
    else:
        Query="SELECT * FROM american_leads"
    cur.execute(Query)
    row_headers=[x[0] for x in cur.description] #this will extract row headers
    rv = cur.fetchall()
    json_data=[]
    for result in rv:
        json_data.append(dict(zip(row_headers,result)))
    cur.close()
    conn.close()
    return ("{ \"data\" :" + (json.dumps(json_data , default=str)) + " } ")

# =============================================================================
# Server-side DataTables endpoint.
#
# The existing /get_all_* endpoints SELECT * with no LIMIT and hand the whole
# table to the browser, which then filters it in JavaScript. On american_leads
# that is 2,786 rows before the user can type. This does the work in SQL.
#
# Every value is parameterised. Identifiers - the sort column - are checked
# against an allowlist, because an identifier cannot be bound as a parameter.
# =============================================================================

# column name -> (searchable, sortable). Nothing outside this map can reach SQL.
AMERICAN_LEAD_COLUMNS = {
    'student_id':           (True,  True),
    'student_name':         (True,  True),
    'student_mobile':       (True,  True),
    'parent_mobile':        (True,  True),
    'year':                 (True,  True),
    'educational_system':   (True,  True),
    'exam_trial':           (True,  True),
    'subject':              (True,  True),
    'course':               (True,  True),
    'school':               (True,  True),
    'email':                (True,  True),
    'source':               (True,  True),
    'status':               (True,  True),
    'recall_date':          (False, True),
    'not_interested_notes': (True,  True),
    'deposit':              (False, True),
    'added_date':           (False, True),
    'added_by':             (True,  True),
    'modified_date':        (False, True),
    'system_section':       (True,  True),
}

# Columns holding a phone number. Searched digits-only so "0109 382-6640",
# "1093826640" and "201093826640" all find the same lead.
PHONE_COLUMNS = ('student_mobile', 'parent_mobile')

# MySQL has no regex-replace before 8.0.17 in every deployment, so strip the
# usual separators explicitly.
def _digits_only_sql(col):
    expr = col
    for ch in (' ', '-', '(', ')', '+', '.'):
        expr = "REPLACE(%s, '%s', '')" % (expr, ch)
    return expr


def _phone_variants(term):
    """A phone typed with or without its trunk 0 / country code should match."""
    digits = ''.join(c for c in term if c.isdigit())
    if not digits:
        return []
    variants = {digits}
    if digits.startswith('00'):
        variants.add(digits[2:])
    if digits.startswith('0'):
        variants.add(digits.lstrip('0'))
    if digits.startswith('20'):
        variants.add(digits[2:])
    else:
        variants.add('20' + digits.lstrip('0'))
    return [v for v in variants if len(v) >= 3]


def _escape_like(term):
    """% and _ are LIKE wildcards. Without escaping, a user typing "100%"
    injects a wildcard into the pattern - not a SQL injection, but it changes
    what the search means and can force an expensive scan."""
    return (term.replace('\\', '\\\\')
                .replace('%', '\\%')
                .replace('_', '\\_'))


def _col_expr(name, spec):
    """A column maps to a SQL expression. Two-item specs are a plain column on
    the base table; three-item specs carry their own expression, which is what
    a joined view needs - "b.course" cannot be written as `course`."""
    if len(spec) >= 3 and spec[2]:
        return spec[2]
    return '`%s`' % name


def _build_search(term, columns, phone_columns):
    """One search term -> (sql_fragment, params). OR across every column."""
    parts, params = [], []
    like = '%' + _escape_like(term) + '%'

    for col, spec in columns.items():
        if not spec[0]:
            continue
        parts.append("%s LIKE %%s" % _col_expr(col, spec))
        params.append(like)

    for col in phone_columns:
        expr = _col_expr(col, columns.get(col, (True, True)))
        for variant in _phone_variants(term):
            parts.append("%s LIKE %%s" % _digits_only_sql(expr))
            params.append('%' + variant + '%')

    if not parts:
        return None, []
    return '(' + ' OR '.join(parts) + ')', params


def _datatables_query(table, columns, phone_columns, request, base_where=None,
                      from_sql=None):
    """Shared server-side handler. Returns the DataTables response dict."""
    draw   = int(request.values.get('draw', 1))
    start  = max(0, int(request.values.get('start', 0)))
    length = int(request.values.get('length', 25))
    if length < 0:
        length = 1000            # "All" in the length menu, still capped
    length = min(length, 1000)

    # --- WHERE: every term must match somewhere (AND of ORs) ---
    search = (request.values.get('search[value]') or '').strip()
    where_parts, params = [], []
    for term in search.split():
        frag, frag_params = _build_search(term, columns, phone_columns)
        if frag:
            where_parts.append(frag)
            params.extend(frag_params)
    # base_where is set by the route, never by the request.
    if base_where:
        where_parts.insert(0, '(' + base_where + ')')
    where_sql = (' WHERE ' + ' AND '.join(where_parts)) if where_parts else ''

    # --- ORDER BY: identifiers come from the allowlist, never from input ---
    order_parts = []
    i = 0
    while True:
        col_idx = request.values.get('order[%d][column]' % i)
        if col_idx is None:
            break
        name = request.values.get('columns[%s][data]' % col_idx)
        direction = 'DESC' if request.values.get('order[%d][dir]' % i) == 'desc' else 'ASC'
        if name in columns and columns[name][1]:
            order_parts.append('%s %s' % (_col_expr(name, columns[name]), direction))
        i += 1
    order_sql = ' ORDER BY ' + ', '.join(order_parts) if order_parts else ''

    # from_sql lets a view join. It is written by the route, never by the
    # request, so it is a literal here by construction.
    source = from_sql if from_sql else '`%s`' % table

    conn, cur = connection()
    try:
        if base_where:
            cur.execute('SELECT COUNT(*) FROM %s WHERE %s' % (source, base_where))
        else:
            cur.execute('SELECT COUNT(*) FROM %s' % source)
        total = cur.fetchone()[0]

        if where_sql:
            cur.execute('SELECT COUNT(*) FROM %s%s' % (source, where_sql), tuple(params))
            filtered = cur.fetchone()[0]
        else:
            filtered = total

        select_cols = ', '.join('%s AS `%s`' % (_col_expr(c, spec), c)
                                for c, spec in columns.items())
        cur.execute(
            'SELECT %s FROM %s%s%s LIMIT %%s OFFSET %%s'
            % (select_cols, source, where_sql, order_sql),
            tuple(params) + (length, start))
        headers = [d[0] for d in cur.description]
        rows = [dict(zip(headers, r)) for r in cur.fetchall()]
    finally:
        cur.close()
        conn.close()

    return {'draw': draw, 'recordsTotal': total,
            'recordsFiltered': filtered, 'data': rows}


@app.route('/api/american_leads', methods=["GET", "POST"])
def api_american_leads():
    # Same visibility as /get_all_american_lead_data, which returns every lead
    # to every role. Not tightened here: that would be a permission change.
    if 'name' not in session:
        return jsonify({'error': 'not_authenticated'}), 401
    payload = _datatables_query('american_leads', AMERICAN_LEAD_COLUMNS,
                                PHONE_COLUMNS, request)
    return app.response_class(json.dumps(payload, default=str),
                              mimetype='application/json')


# A row in these lists is an event, not a client. A client with three events
# appears three times, once per event, which is what the team is actually
# working through. The client's own details ride along from the join.
EVENT_FROM = ('`event_event` AS e '
              'JOIN `event_client` AS c ON c.client_id = e.client_id')

EVENT_LEAD_COLUMNS = {
    'event_id':       (False, True,  'e.event_id'),
    'client_id':      (True,  True,  'e.client_id'),
    'event_name':     (True,  True,  'e.event_name'),
    'client_name':    (True,  True,  'c.client_name'),
    'client_mobile':  (True,  True,  'c.client_mobile'),
    'client_email':   (True,  True,  'c.client_email'),
    'status':         (True,  True,  'e.status'),
    'payment_status': (True,  True,  'e.payment_status'),
    'temperature':    (True,  True,  'e.temperature'),
    'deposit_flag':   (False, True,  'e.deposit_flag'),
    'deposit':        (False, True,  'e.deposit'),
    'total':          (False, True,  'e.total'),
    'remaining':      (False, True,  'e.remaining'),
    'done':           (False, True,  'e.done'),
    'recall_date':    (False, True,  'e.recall_date'),
    'added_by':       (True,  True,  'e.added_by'),
    'added_date':     (False, True,  'e.added_date'),
    'modified_by':    (True,  True,  'e.modified_by'),
    'modified_date':  (False, True,  'e.modified_date'),
}

EVENT_PHONE_COLUMNS = ('c.client_mobile',)


@app.route('/api/event_leads', methods=["GET", "POST"])
def api_event_leads():
    # Same visibility as /get_all_event_lead_data.
    if 'name' not in session:
        return jsonify({'error': 'not_authenticated'}), 401
    payload = _datatables_query(None, EVENT_LEAD_COLUMNS,
                                EVENT_PHONE_COLUMNS, request,
                                from_sql=EVENT_FROM)
    return app.response_class(json.dumps(payload, default=str),
                              mimetype='application/json')


# Active-lead views are the same tables filtered to open leads, so they reuse
# the column maps and add a fixed WHERE the caller cannot influence.
@app.route('/api/american_active_leads', methods=["GET", "POST"])
def api_american_active_leads():
    if 'name' not in session:
        return jsonify({'error': 'not_authenticated'}), 401
    payload = _datatables_query('american_leads', AMERICAN_LEAD_COLUMNS,
                                PHONE_COLUMNS, request,
                                base_where="`status` = 'pending'")
    return app.response_class(json.dumps(payload, default=str),
                              mimetype='application/json')


@app.route('/api/event_active_leads', methods=["GET", "POST"])
def api_event_active_leads():
    if 'name' not in session:
        return jsonify({'error': 'not_authenticated'}), 401
    payload = _datatables_query(None, EVENT_LEAD_COLUMNS,
                                EVENT_PHONE_COLUMNS, request,
                                base_where="e.`status` IN ('pending','not_contacted')",
                                from_sql=EVENT_FROM)
    return app.response_class(json.dumps(payload, default=str),
                              mimetype='application/json')


# The detailed course report is american_leads joined to course_status, so a
# lead appears once per course it is enrolled on. Columns carry their own
# expression because "b.course" cannot be written as `course`, and the two
# joined columns keep the course1 / course_status1 names the page already uses.
DETAILED_REPORT_FROM = ('`american_leads` AS a '
                        'LEFT JOIN `course_status` AS b ON a.student_id = b.student_id')

DETAILED_REPORT_COLUMNS = {
    'student_id':           (True,  True,  'a.student_id'),
    'student_name':         (True,  True,  'a.student_name'),
    'student_mobile':       (True,  True,  'a.student_mobile'),
    'parent_mobile':        (True,  True,  'a.parent_mobile'),
    'year':                 (True,  True,  'a.year'),
    'educational_system':   (True,  True,  'a.educational_system'),
    'exam_trial':           (True,  True,  'a.exam_trial'),
    'subject':              (True,  True,  'a.subject'),
    'course1':              (True,  True,  'b.course'),
    'school':               (True,  True,  'a.school'),
    'email':                (True,  True,  'a.email'),
    'source':               (True,  True,  'a.source'),
    'course_status1':       (True,  True,  'b.status'),
    'recall_date':          (False, True,  'a.recall_date'),
    'not_interested_notes': (True,  True,  'a.not_interested_notes'),
    'deposit':              (False, True,  'a.deposit'),
    'added_date':           (False, True,  'a.added_date'),
    'added_by':             (True,  True,  'a.added_by'),
    'modified_date':        (False, True,  'a.modified_date'),
    'system_section':       (True,  True,  'a.system_section'),
}

DETAILED_REPORT_PHONE = ('student_mobile', 'parent_mobile')


@app.route('/api/american_leads_detailed', methods=["GET", "POST"])
def api_american_leads_detailed():
    # Same visibility as /get_american_leads_detailed, which returns the whole
    # join to every role.
    if 'name' not in session:
        return jsonify({'error': 'not_authenticated'}), 401
    payload = _datatables_query(None, DETAILED_REPORT_COLUMNS,
                                DETAILED_REPORT_PHONE, request,
                                from_sql=DETAILED_REPORT_FROM)
    return app.response_class(json.dumps(payload, default=str),
                              mimetype='application/json')


# =============================================================================
# Calendar.
#
# Ported from 51_education_nginx, which reads the same two tables out of the
# 51_center database. Structure and data were copied into crm51_db; that
# project and its database were only ever read, never written.
#
# Read-only for now: the page renders appointments and rooms. Creating and
# editing them is a separate decision - the source project writes recurrence
# by expanding it into one row per occurrence, which is worth reviewing before
# it is carried over.
#
# `code` is the source system's tenant discriminator. Every row carries 51, so
# it is pinned here rather than taken from the session, which has no such key.
# =============================================================================

CALENDAR_CODE = 51


@app.route('/calendar', methods=["GET"])
def calendar():
    return render_template("calendar.html")


@app.route('/appointment_data', methods=["GET", "POST"])
def appointment_data():
    """Unfinished appointments for one room."""
    room = (request.values.get('room') or '').strip()
    if not room:
        return app.response_class(json.dumps([]), mimetype='application/json')

    conn, cur = connection()
    try:
        cur.execute(
            "SELECT appointment_id, instructor, class_name, description, username,"
            " room, title, start, end, day, repeat_code, repeat_number,"
            " total_repeat_number, repeat_frequency,"
            " CONVERT(repeat_end_date, CHAR) AS repeat_end_date"
            " FROM appointment"
            " WHERE finished != TRUE AND room = %s AND code = %s",
            (room, CALENDAR_CODE))
        headers = [d[0] for d in cur.description]
        rows = [dict(zip(headers, r)) for r in cur.fetchall()]
    finally:
        cur.close()
        conn.close()
    return app.response_class(json.dumps(rows, default=str),
                              mimetype='application/json')


@app.route('/appointment_data_finished', methods=["GET", "POST"])
def appointment_data_finished():
    """Finished appointments for one room."""
    room = (request.values.get('room') or '').strip()
    if not room:
        return app.response_class(json.dumps([]), mimetype='application/json')

    conn, cur = connection()
    try:
        cur.execute(
            "SELECT appointment_id, instructor, class_name, description, username,"
            " room, title, start, end, day, repeat_code, repeat_number,"
            " total_repeat_number, repeat_frequency,"
            " CONVERT(repeat_end_date, CHAR) AS repeat_end_date"
            " FROM appointment"
            " WHERE finished = TRUE AND room = %s AND code = %s",
            (room, CALENDAR_CODE))
        headers = [d[0] for d in cur.description]
        rows = [dict(zip(headers, r)) for r in cur.fetchall()]
    finally:
        cur.close()
        conn.close()
    return app.response_class(json.dumps(rows, default=str),
                              mimetype='application/json')


@app.route('/room_data', methods=["GET", "POST"])
def room_data():
    conn, cur = connection()
    try:
        cur.execute("SELECT room_id, room_name FROM room WHERE code = %s"
                    " ORDER BY room_id", (CALENDAR_CODE,))
        headers = [d[0] for d in cur.description]
        rows = [dict(zip(headers, r)) for r in cur.fetchall()]
    finally:
        cur.close()
        conn.close()
    return app.response_class(json.dumps(rows, default=str),
                              mimetype='application/json')


# --- calendar writes ---------------------------------------------------------
#
# A room cannot hold two appointments at once. That is enforced here, on every
# write, not only in the calendar UI - a client-side guard is a convenience,
# and anything that posts directly would walk straight past it.
#
# It is enforced going forward only. The data carries 154 overlapping pairs
# across 287 rows, dating from 2021 to 2027 and 27 of them still in the future,
# so a database constraint would reject real bookings that already exist. Those
# are reported by /api/calendar/conflicts instead of being deleted.

ISO_MINUTE = "%Y-%m-%dT%H:%M"


def _valid_slot(start, end):
    """Both parse, same day, and start is before end."""
    try:
        s = datetime.datetime.strptime(start, ISO_MINUTE)
        e = datetime.datetime.strptime(end, ISO_MINUTE)
    except (TypeError, ValueError):
        return None, None, 'bad_format'
    if e <= s:
        return None, None, 'end_before_start'
    if s.date() != e.date():
        return None, None, 'spans_days'
    return s, e, None


def _conflicts(cur, room, start, end, exclude_id=None):
    """Rows in the same room whose time range intersects [start, end).

    Touching at an edge is not an overlap: 18:00-19:00 and 19:00-20:00 are
    back to back, which is normal scheduling. The comparison is a plain string
    compare, which is correct because every value is a zero-padded
    YYYY-MM-DDTHH:MM - verified across all 7,740 rows.
    """
    sql = ("SELECT appointment_id, title, room, start, end FROM appointment"
           " WHERE room = %s AND code = %s AND finished != TRUE"
           " AND start < %s AND %s < end")
    params = [room, CALENDAR_CODE, end, start]
    if exclude_id is not None:
        sql += " AND appointment_id <> %s"
        params.append(exclude_id)
    cur.execute(sql, tuple(params))
    return [dict(zip([d[0] for d in cur.description], r)) for r in cur.fetchall()]


def _conflict_response(rows):
    return jsonify({
        'state': 'conflict',
        'message': ('That slot is already booked in this room.' if len(rows) == 1
                    else 'That slot clashes with %d bookings in this room.' % len(rows)),
        'conflicts': [{'id': r['appointment_id'], 'title': r['title'],
                       'start': r['start'], 'end': r['end']} for r in rows],
    }), 409


@app.route('/api/calendar/move', methods=["POST"])
def api_calendar_move():
    """Drag or resize: a new start/end, and possibly a new room."""
    if 'name' not in session:
        return jsonify({'state': 'not_authenticated'}), 401

    try:
        appointment_id = int(request.form['id'])
    except (KeyError, TypeError, ValueError):
        return jsonify({'state': 'bad_id'}), 400

    start = (request.form.get('start') or '').strip()
    end = (request.form.get('end') or '').strip()
    room = (request.form.get('room') or '').strip()

    s, e, err = _valid_slot(start, end)
    if err:
        return jsonify({'state': err}), 400

    conn, cur = connection()
    try:
        found = cur.execute("SELECT room, start, end FROM appointment"
                            " WHERE appointment_id = %s AND code = %s",
                            (appointment_id, CALENDAR_CODE))
        if not int(found):
            return jsonify({'state': 'not_found'}), 404
        (current_room, _, _) = cur.fetchone()
        room = room or current_room

        clash = _conflicts(cur, room, start, end, exclude_id=appointment_id)
        if clash:
            return _conflict_response(clash)

        cur.execute("UPDATE appointment SET start = %s, end = %s, room = %s,"
                    " day = %s WHERE appointment_id = %s AND code = %s",
                    (start, end, room, s.strftime('%A'), appointment_id, CALENDAR_CODE))
        conn.commit()
        return jsonify({'state': 'success', 'id': appointment_id,
                        'start': start, 'end': end, 'room': room})
    except Exception as exc:
        conn.rollback()
        print('calendar move failed:', exc)
        return jsonify({'state': 'error'}), 500
    finally:
        cur.close()
        conn.close()


@app.route('/api/calendar/create', methods=["POST"])
def api_calendar_create():
    """One appointment in one slot. Recurrence is not created here."""
    if 'name' not in session:
        return jsonify({'state': 'not_authenticated'}), 401

    room = (request.form.get('room') or '').strip()
    instructor = (request.form.get('instructor') or '').strip()
    class_name = (request.form.get('class_name') or '').strip()
    description = (request.form.get('description') or '').strip()
    start = (request.form.get('start') or '').strip()
    end = (request.form.get('end') or '').strip()

    if not room:
        return jsonify({'state': 'room_required'}), 400
    if not instructor and not class_name:
        return jsonify({'state': 'title_required'}), 400

    s, e, err = _valid_slot(start, end)
    if err:
        return jsonify({'state': err}), 400

    conn, cur = connection()
    try:
        exists = cur.execute("SELECT room_id FROM room WHERE room_name = %s AND code = %s",
                             (room, CALENDAR_CODE))
        if not int(exists):
            return jsonify({'state': 'unknown_room'}), 400

        clash = _conflicts(cur, room, start, end)
        if clash:
            return _conflict_response(clash)

        title = ' - '.join([p for p in (instructor, class_name) if p])
        repeat_code = datetime.datetime.now().strftime('%y%m%d%H%M%S')
        cur.execute(
            "INSERT INTO appointment (instructor, class_name, description, room,"
            " repeat_frequency, start, end, day, appointment_date, username, title,"
            " repeat_code, repeat_number, total_repeat_number, repeat_end_date, code)"
            " VALUES (%s,%s,%s,%s,'No Repeat',%s,%s,%s,%s,%s,%s,%s,1,1,%s,%s)",
            (instructor, class_name, description, room, start, end,
             s.strftime('%A'), s.strftime('%Y-%m-%d %H:%M:%S'),
             session['name'], title, repeat_code, s.strftime('%Y-%m-%d'), CALENDAR_CODE))
        conn.commit()
        return jsonify({'state': 'success', 'id': cur.lastrowid, 'title': title})
    except Exception as exc:
        conn.rollback()
        print('calendar create failed:', exc)
        return jsonify({'state': 'error'}), 500
    finally:
        cur.close()
        conn.close()


@app.route('/api/calendar/delete', methods=["POST"])
def api_calendar_delete():
    if 'name' not in session:
        return jsonify({'state': 'not_authenticated'}), 401
    try:
        appointment_id = int(request.form['id'])
    except (KeyError, TypeError, ValueError):
        return jsonify({'state': 'bad_id'}), 400

    conn, cur = connection()
    try:
        cur.execute("DELETE FROM appointment WHERE appointment_id = %s AND code = %s",
                    (appointment_id, CALENDAR_CODE))
        conn.commit()
        return jsonify({'state': 'success', 'deleted': cur.rowcount})
    except Exception as exc:
        conn.rollback()
        print('calendar delete failed:', exc)
        return jsonify({'state': 'error'}), 500
    finally:
        cur.close()
        conn.close()


@app.route('/api/calendar/conflicts', methods=["GET", "POST"])
def api_calendar_conflicts():
    """Overlaps already in the data, so they can be seen and resolved."""
    if 'name' not in session:
        return jsonify({'state': 'not_authenticated'}), 401
    room = (request.values.get('room') or '').strip()

    sql = ("SELECT a.appointment_id AS id, a.title, a.room, a.start, a.end,"
           " b.appointment_id AS other_id, b.title AS other_title,"
           " b.start AS other_start, b.end AS other_end"
           " FROM appointment a JOIN appointment b"
           "  ON a.room = b.room AND a.code = b.code"
           " AND a.appointment_id < b.appointment_id"
           " AND a.finished != TRUE AND b.finished != TRUE"
           " AND a.start < b.end AND b.start < a.end"
           " WHERE a.code = %s")
    params = [CALENDAR_CODE]
    if room:
        sql += " AND a.room = %s"
        params.append(room)
    sql += " ORDER BY a.start DESC LIMIT 500"

    conn, cur = connection()
    try:
        cur.execute(sql, tuple(params))
        rows = [dict(zip([d[0] for d in cur.description], r)) for r in cur.fetchall()]
    finally:
        cur.close()
        conn.close()
    return app.response_class(json.dumps({'count': len(rows), 'conflicts': rows}, default=str),
                              mimetype='application/json')


@app.route('/american_active_leads', methods=["GET","POST"])
def american_active_leads():
    return render_template("american_active_leads.html")

@app.route('/get_active_american_lead_data',methods=["GET", "POST"])
def get_active_american_lead_data():

    conn, cur = connection()

    if session['role'] == 'admin':
        Query="SELECT * FROM american_leads WHERE status = 'pending';"
    else:
        Query="SELECT * FROM american_leads WHERE status = 'pending' AND student_id in (SELECT student_id FROM assignation WHERE username = '"+str(session['name'])+"');"
    cur.execute(Query)
    row_headers=[x[0] for x in cur.description] #this will extract row headers
    rv = cur.fetchall()
    json_data=[]
    for result in rv:
        json_data.append(dict(zip(row_headers,result)))
    cur.close()
    conn.close()
    return ("{ \"data\" :" + (json.dumps(json_data , default=str)) + " } ")


@app.route('/get_american_leads_detailed',methods=["GET", "POST"])
def get_american_leads_detailed():

    conn, cur = connection()

    #if session['role'] == 'admin':
    Query="select a.*,b.course as course1,b.status as course_status1 from american_leads as a left join course_status as b on a.student_id=b.student_id "
    #else:
    #    Query="select a.*,b.course as course1,b.status as course_status1 from american_leads as a left join course_status as b on a.student_id=b.student_id WHERE   a.student_id in (SELECT student_id FROM assignation WHERE username = '"+str(session['name'])+"');"
    cur.execute(Query)
    row_headers=[x[0] for x in cur.description] #this will extract row headers
    rv = cur.fetchall()
    json_data=[]
    for result in rv:
        json_data.append(dict(zip(row_headers,result)))
    cur.close()
    conn.close()
    return ("{ \"data\" :" + (json.dumps(json_data , default=str)) + " } ")



@app.route('/event_active_leads', methods=["GET","POST"])
def event_active_leads():
    return render_template("event_active_leads.html")

@app.route('/get_active_event_lead_data',methods=["GET", "POST"])
def get_active_event_lead_data():

    conn, cur = connection()

    if session['role'] == 'admin':
        #Query="SELECT client_id, client_name, client_mobile, client_email, client_payment_status, status, if(client_deposit_flag, 'yes','no') as client_deposit_flag, client_deposit , if(done, 'yes', 'no') as done, added_date, added_by, modified_by, modified_date from event_leads WHERE status = 'pending' or status = 'not_contacted' "
        Query="SELECT client_id, client_name, client_mobile, client_email, client_payment_status, status, if(client_deposit_flag, 'yes','no') as client_deposit_flag, client_deposit , if(done, 'yes', 'no') as done, added_date, added_by, modified_by, modified_date from event_leads;"
    else:
        #Query="SELECT client_id, client_name, client_mobile, client_email, client_payment_status, status ,if(client_deposit_flag, 'yes','no') as client_deposit_flag, client_deposit , if(done, 'yes', 'no') as done, added_date, added_by, modified_by, modified_date from event_leads WHERE (status = 'pending' or status = 'not_contacted') AND client_id in (SELECT client_id FROM event_assignation WHERE username = '"+str(session['name'])+"');"
        Query="SELECT client_id, client_name, client_mobile, client_email, client_payment_status, status ,if(client_deposit_flag, 'yes','no') as client_deposit_flag, client_deposit , if(done, 'yes', 'no') as done, added_date, added_by, modified_by, modified_date from event_leads WHERE status != 'not_interested' and client_id in (SELECT client_id FROM event_assignation WHERE username = '"+str(session['name'])+"');"

    cur.execute(Query)
    row_headers=[x[0] for x in cur.description] #this will extract row headers
    rv = cur.fetchall()
    json_data=[]
    for result in rv:
        json_data.append(dict(zip(row_headers,result)))
    cur.close()
    conn.close()
    return ("{ \"data\" :" + (json.dumps(json_data , default=str)) + " } ")

###### CRM DBs ###########


### ADMIN SETTINGS ###

@app.route('/admin_settings', methods=["GET","POST"])
def admin_settings():

    if session['role'] != 'admin':
        return redirect(url_for("/home"))

    return render_template("admin_settings.html")

@app.route('/delete_educational_system', methods=["POST"])
def delete_educational_system():

    educational_system_id = request.form['educational_system_id']

    conn, cur = connection()
    try:
        x=cur.execute("select role from user where username=%s",(session['name'],))
        if int(x) == 0:
            return jsonify({'state':'failed'})
        else:
            (role,)=cur.fetchone()
            if role.lower() == 'admin':
                Query="DELETE FROM educational_system WHERE id = '"+str(educational_system_id)+"';"
                cur.execute(Query)
                conn.commit()


                cur.close()
                conn.close()

                return jsonify({'state':'success'})
            else:
                cur.close()
                conn.close()

                return jsonify({'state':'no_access'})

    except Exception as e:
        print(e)
        cur.close()
        conn.close()
        return jsonify({'state':'failed'})


@app.route('/delete_subject', methods=["POST"])
def delete_subject():

    subject_id = request.form['subject_id']

    conn, cur = connection()
    try:
        x=cur.execute("select role from user where username=%s",(session['name'],))
        if int(x) == 0:
            return jsonify({'state':'failed'})
        else:
            (role,)=cur.fetchone()
            if role.lower() == 'admin':
                Query="DELETE FROM subject WHERE id = '"+str(subject_id)+"';"
                cur.execute(Query)
                conn.commit()

                cur.close()
                conn.close()

                return jsonify({'state':'success'})
            else:
                cur.close()
                conn.close()

                return jsonify({'state':'no_access'})

    except Exception as e:
        print(e)
        cur.close()
        conn.close()
        return jsonify({'state':'failed'})


@app.route('/delete_exam_trial', methods=["POST"])
def delete_exam_trial():

    exam_trial_id = request.form['exam_trial_id']

    conn, cur = connection()
    try:
        x=cur.execute("select role from user where username=%s",(session['name'],))
        if int(x) == 0:
            return jsonify({'state':'failed'})
        else:
            (role,)=cur.fetchone()
            if role.lower() == 'admin':
                Query="DELETE FROM exam_trial WHERE id = '"+str(exam_trial_id)+"';"
                cur.execute(Query)
                conn.commit()

                cur.close()
                conn.close()

                return jsonify({'state':'success'})
            else:
                cur.close()
                conn.close()

                return jsonify({'state':'no_access'})

    except Exception as e:
        print(e)
        cur.close()
        conn.close()
        return jsonify({'state':'failed'})


#### MANAGE COURSES ######
@app.route('/hold_course', methods=["POST"])
def hold_course():

    course_id = request.form['course_id']

    conn, cur = connection()
    try:
        Query="SELECT hold FROM course WHERE id = '"+str(course_id)+"';"
        cur.execute(Query)
        hold = cur.fetchone()

        print(hold)
        print(hold[0])

        if hold[0] == 1:
            Query="UPDATE course SET hold = false WHERE id = '"+str(course_id)+"';"
            cur.execute(Query)
            conn.commit()

            cur.close()
            conn.close()
            return jsonify({'state':'unholded'})

        elif hold[0] == 0:
            Query="UPDATE course SET hold = true WHERE id = '"+str(course_id)+"';"
            cur.execute(Query)
            conn.commit()

            cur.close()
            conn.close()
            return jsonify({'state':'holded'})

    except Exception as e:
        print(e)
        cur.close()
        conn.close()
        return jsonify({'state':'failed'})


@app.route('/avail_course', methods=["POST"])
def avail_course():

    course_id = request.form['course_id']

    conn, cur = connection()
    try:
        Query="SELECT form FROM course WHERE id = '"+str(course_id)+"';"
        cur.execute(Query)
        avail = cur.fetchone()

        print(avail)
        print(avail[0])

        if avail[0] == 1:
            Query="UPDATE course SET form = false WHERE id = '"+str(course_id)+"';"
            cur.execute(Query)
            conn.commit()

            cur.close()
            conn.close()
            return jsonify({'state':'unavail'})

        elif avail[0] == 0:
            Query="UPDATE course SET form = true WHERE id = '"+str(course_id)+"';"
            cur.execute(Query)
            conn.commit()

            cur.close()
            conn.close()
            return jsonify({'state':'avail'})

    except Exception as e:
        print(e)
        cur.close()
        conn.close()
        return jsonify({'state':'failed'})


@app.route('/delete_course', methods=["POST"])
def delete_course():

    course_id = request.form['course_id']

    conn, cur = connection()
    try:
        x=cur.execute("select role from user where username=%s",(session['name'],))
        if int(x) == 0:
            return jsonify({'state':'failed'})
        else:
            (role,)=cur.fetchone()
            if role.lower() == 'admin':
                Query="DELETE FROM course WHERE id = '"+str(course_id)+"';"
                cur.execute(Query)
                conn.commit()

                cur.close()
                conn.close()

                return jsonify({'state':'success'})
            else:
                cur.close()
                conn.close()

                return jsonify({'state':'no_access'})

    except Exception as e:
        print(e)
        cur.close()
        conn.close()
        return jsonify({'state':'failed'})

### ADMIN SETTINGS ###

#### USERS START ######

@app.route('/account_settings', methods=["GET","POST"])
def account_settings():
    return render_template("account_settings.html")

@app.route('/change_pass', methods=["POST"])
def change_pass():
    if request.method == 'POST':
        password = request.form['password']
        user_id = request.form['id']
        print("Changing Password for ID: "+ str(id))
        
        conn, cur = connection()
        try:
            cur.execute("Update user set password = %s where user_id = %s", (password,user_id,))
            conn.commit()
            cur.close()
            conn.close()

            return jsonify({'state':'success'})

        except Exception as e:
            print(e)
            return jsonify({'state':'fail'})
        
@app.route('/get_course_data', methods=["GET", "POST"])
def get_course_data():
        conn, cur = connection()
        Query="SELECT * FROM course"
        cur.execute(Query)
        row_headers = [x[0] for x in cur.description]  # this will extract row headers

        rv = cur.fetchall()
        print(rv)
        json_data = []
        for result in rv:
            json_data.append(dict(zip(row_headers, result)))

        cur.close()
        conn.close()     
        
        return (json.dumps(json_data , default=str))

@app.route('/get_form_course_data', methods=["GET", "POST"])
def get_form_course_data():
        conn, cur = connection()
        Query="SELECT * FROM course where hold=false and form=true "
        cur.execute(Query)
        row_headers = [x[0] for x in cur.description]  # this will extract row headers

        rv = cur.fetchall()
        print(rv)
        json_data = []
        for result in rv:
            json_data.append(dict(zip(row_headers, result)))

        cur.close()
        conn.close()     
        
        return (json.dumps(json_data , default=str))
            
@app.route('/users', methods=["GET", "POST"])
def users():
    if session['name'] == 'External Course Form' or session['id'] == 0 or session['role'] == 'ExternalUser':
                return 'Not Authorized'
    if 'get_users' in request.args :
        conn, cur = connection()
        myusername=session['name']
        x=cur.execute("select role from user where username=%s",(myusername,))
        if int(x) == 1:
            (myrole,) = cur.fetchone()
        else:
            cur.close()
            conn.close()
            return jsonify({"state":"system_error"})

        if myrole == 'admin':   
            Query="SELECT user_id, username, role, scope FROM user;"
        else:
            Query="SELECT user_id, username, role, scope FROM user where username='"+myusername+"';"
        cur.execute(Query)
        row_headers = [x[0] for x in cur.description]  # this will extract row headers

        rv = cur.fetchall()
        print(rv)
        json_data = []
        for result in rv:
            json_data.append(dict(zip(row_headers, result)))

        cur.close()
        conn.close()     
        
        return ("{ \"data\" :" + (json.dumps(json_data , default=str)) + " } ")

    if 'get_notify_user' in request.args :
        conn, cur = connection()
        

        Query="SELECT user_id, username, role FROM user "
        cur.execute(Query)
        row_headers = [x[0] for x in cur.description]  # this will extract row headers

        rv = cur.fetchall()
        print(rv)
        json_data = []
        for result in rv:
            json_data.append(dict(zip(row_headers, result)))

        cur.close()
        conn.close()     
        
        return ("{ \"data\" :" + (json.dumps(json_data , default=str)) + " } ")

    if 'get_select_users' in request.args :
        conn, cur = connection()
        Query="SELECT user_id, username, role FROM user;"
        cur.execute(Query)
        row_headers = [x[0] for x in cur.description]  # this will extract row headers

        rv = cur.fetchall()
        print(rv)
        json_data = []
        for result in rv:
            json_data.append(dict(zip(row_headers, result)))

        cur.close()
        conn.close()     
        
        return (json.dumps(json_data , default=str))

    if 'get_select_users_event' in request.args :
        conn, cur = connection()
        Query="SELECT user_id, username, role FROM user WHERE scope != 'course';"
        cur.execute(Query)
        row_headers = [x[0] for x in cur.description]  # this will extract row headers

        rv = cur.fetchall()
        print(rv)
        json_data = []
        for result in rv:
            json_data.append(dict(zip(row_headers, result)))

        cur.close()
        conn.close()     
        
        return (json.dumps(json_data , default=str))

    if request.method == 'POST' and 'add_user' in request.args :
        user_name = request.form['user_name']
        user_type = request.form['user_type']
        password = request.form['password']
        scope = request.form['scope']
        
        print(user_name)
        print(password)
        print(user_type)

        if user_name == "" or password == "" or user_type == "" or scope == "" :
            return jsonify({"state":"missing_fields"})

        conn, cur = connection()
        try:

            ### 1st Check that username is unique ###

            x=cur.execute("select username from user where username=%s",(user_name,))
            if int(x) > 0:
                cur.close()
                conn.close()
                return jsonify({"state":"duplicate"})

            cur.execute("INSERT INTO user (username, password, role, scope, theme) VALUES (%s,%s,%s,%s,%s);", (user_name, password, user_type,scope, 'navbar-dark bg-dark',))
            conn.commit()
            cur.close()
            conn.close()

            return jsonify({'state':'success'})

        except Exception as e:
            print(e)
            cur.close()
            conn.close()
            return jsonify({'state':'failed'})

    if request.method == 'POST' and 'delete_user' in request.args :
        user_id = request.form['user_id']

        print(user_id)

        try:
            conn,cur=connection()
            cur.execute("DELETE FROM user WHERE user_id = (%s)", (user_id,))
            conn.commit()
            cur.close()
            conn.close()

            return jsonify({'state':'success'})

        except Exception as e:
            print(e)
            cur.close()
            conn.close()
            return jsonify({'state':'failed'})


    if request.method == 'POST' and 'change_role' in request.args :

        if session['role'] != 'admin':
            return jsonify({'state':'unauthorized'})

        user_id = request.form['id']
        new_role = request.form['new_role']

        try:
            conn,cur=connection()
            cur.execute("UPDATE user SET role = %s WHERE user_id = (%s)", (new_role, user_id,))
            conn.commit()
            cur.close()
            conn.close()

            return jsonify({'state':'success'})

        except Exception as e:
            print(e)
            cur.close()
            conn.close()
            return jsonify({'state':'failed'})

    if request.method == 'POST' and 'change_scope' in request.args :

        if session['role'] != 'admin':
            return jsonify({'state':'unauthorized'})

        user_id = request.form['id']
        new_scope = request.form['new_scope']

        try:
            conn,cur=connection()
            cur.execute("UPDATE user SET scope = %s WHERE user_id = (%s)", (new_scope, user_id,))
            conn.commit()
            cur.close()
            conn.close()

            return jsonify({'state':'success'})

        except Exception as e:
            print(e)
            cur.close()
            conn.close()
            return jsonify({'state':'failed'})

    return render_template("admin_users.html")

### USERS END ######

@app.route('/home', methods=["GET","POST"])
def home():
    if session['name'] == 'External Course Form' or session['id'] == 0 or session['role'] == 'ExternalUser':
                return 'Not Authorized'
    return render_template("home.html")

@app.route('/course_form', methods=["GET","POST"])
def course_form():



    if request.method == 'POST' and 'add_lead':
        
        student_mobile=int(request.form['student_mobile'])
        student_name=request.form['student_name']
        parent_mobile=request.form['parent_mobile']
        
        gender=""
        

        try:
            year=request.form['year']
        except:
            year = ""

        school=request.form['school']

        educational_system = request.form['educational_system']

        course = request.form.getlist('course[]')
        conn,cur=connection()
        if len(course) == 0:
            return jsonify({"state":"error","reason":"Course is a Mandotory Field"})
         
        else:
            for courses in course:
                detect_unavailable_courses_count=cur.execute("select id from course where hold=false and form=true and course=%s",(courses,))
                if int(detect_unavailable_courses_count) != 1 :
                      return jsonify({"state":"course_holded","reason":"One of the courses is now not available"})

            course = ",".join(course)
        email=request.form['email']
        source= request.form['source']
        status = 'pending'
        recall_date = None
        not_interested_notes = ''  
        trial = "0"
        maths = None
        english = None
        other = None
        deposit = None
        notes=request.form['notes']
        if notes == '':
            notes = 'No Notes Added from the Course Form User'
        added_by='Course Form User'
        assigned_to = []
        conn,cur=connection()
        cur.execute("SELECT username FROM user WHERE scope != 'event'")
        for userss in cur.fetchall():
            assigned_to.append(userss)
        system_section='External Course Form'
        done="0"
        response={}
        cur.close()
        conn.close()
        session['name']='External Course Form'
        session['id']=0
        session['role'] = 'ExternalUser'
        function_response = creating_american_lead(student_mobile, student_name, parent_mobile,year, gender, educational_system, school, email,course, source, status, recall_date,not_interested_notes, deposit,trial,maths,english,other, added_by, system_section, assigned_to,notes,done)
        return jsonify(function_response)
    return render_template("course_form.html")

@app.route('/update_american_lead', methods=["GET","POST"])
def update_american_lead():
    if request.method == 'POST' and 'update_student_lead' in request.args :
        student_id=request.form['student_id']
        student_mobile=int(request.form['student_mobile'])
        student_name=request.form['student_name']
        parent_mobile=request.form['parent_mobile']
        try:
            gender=request.form['gender']
        except:
            gender = ""
        year=request.form['year']

        try:
            deposit=request.form['deposit']
        except:
            deposit = None
        year=request.form['year']
        educational_system=request.form['educational_system']
        school=request.form['school']
        email=request.form['email']
        source=request.form['source']
        assigned_to_list = request.form.getlist('assigned_to[]')

       
        course_list = request.form.getlist('course[]')
        course = ",".join(course_list)


        status=request.form['status']
        
        if status == 'pending' :
            recall_date=request.form['recall_date']
            if str(recall_date) == "":
                recall_date = None
            not_interested_notes = ""
            edu_student_id=None
        elif status == 'not_interested':
            recall_date = None
            edu_student_id=None
            try:
                not_interested_notes = request.form['not_interested_notes']
                if not_interested_notes == "" or not_interested_notes == None :
                    return jsonify({"state":"error","reason":"Kindly add reason for not interested state to continue"})
            except  :
                return jsonify({"state":"error","reason":"Kindly add reason for not interested state to continue"})

        else:
            recall_date = None
            not_interested_notes=""
            try:
                edu_student_id = request.form['edu_student_id']
                if edu_student_id == "" or edu_student_id == None :
                    return jsonify({"state":"error","reason":"Kindly add Educational System ID for enrol status"})
            except  :
                return jsonify({"state":"error","reason":"Kindly add Educational System ID for enrol status"})


        trial = request.form['trial']
        done="0"
        if trial == "0":
            math = None
            english=None
            other=None
        else:
            try:
                math=request.form['math']
            except:
                math=None
            try:
                english=request.form['english']
            except:
                english=None
            try:
                other=request.form['other']
            except:
                other=None
        notes=request.form['notes']
        conn,cur=connection()
        x=cur.execute("select student_id from american_leads where student_mobile=%s and student_id != %s",(student_mobile,student_id,))
        if int(x) > 0:
            (exist_student_id,)=cur.fetchone()
            return jsonify({"state":"error","reason":"Mobile Number is already exists with ID "+ str(exist_student_id)})
        else:

            ty=cur.execute("select course from course_status where student_id=%s",(student_id,))
            course_status_list=[]
            
            for crse_status in cur.fetchall():
                    course_status_list.append(crse_status[0])
            add_course_status = []
            delete_course_status = []
            
            print(course_list,course_status_list)
            for crse_item in course_list:
                if crse_item not in course_status_list:
                    add_course_status.append(crse_item)
            
            for crse_item1 in course_status_list:
                if crse_item1 not in course_list:
                    delete_course_status.append(crse_item1)

            print(add_course_status,delete_course_status)


            


            cur.execute("select student_mobile,student_name,parent_mobile,gender,year,educational_system,exam_trial,subject,course,subject_id,exam_trial_id,school,email,source,status,recall_date,not_interested_notes,deposit,added_date,added_by,modified_date,system_section,done,trial,maths,english,other,edu_system_id,course from american_leads where student_id=%s",(student_id,))
            (student_mobile1,student_name1,parent_mobile1,gender1,year1,educational_system1,exam_trial1,subject1,course1,subject_id1,exam_trial_id1,school1,email1,source1,status1,recall_date1,not_interested_notes1,deposit1,added_date1,added_by1,modified_date1,system_section1,done1,trial1,maths1,english1,other1,edu_student_id1,course1,)=cur.fetchone()

            if session['role'] != 'admin':
                cur.execute("select username from assignation where student_id=%s",(student_id,))
                for mycurrentassignation in cur.fetchall():
                    assigned_to_list.append(mycurrentassignation[0])

            if session['role'] == 'admin':
                assignation_flag_matched = True      
                BE_assigned_to = [] 
                tt=cur.execute("select username from assignation where student_id=%s",(student_id,))
                if int(tt) > 0:
                    for record in cur.fetchall():
                        BE_assigned_to.append(record[0])
                
                


                if int(len(BE_assigned_to)) == int(len(assigned_to_list)):
                    for assi_item in assigned_to_list:
                        if assi_item not in BE_assigned_to:
                            assignation_flag_matched = False
                            break
                else:
                    assignation_flag_matched = False
            else:
                assignation_flag_matched = True

            

            if math == None or str(math) == '':
                math=None
            else:
                math=float(math) 
            if maths1 == None or str(maths1) == '':
                maths1=None
                
            else:
                maths1=float(maths1)
            if english == None or str(english) == '':
                
                english=None
            else:
                english=float(english)
            if english1 == None or str(english1) == '':
                
                english1=None
            else:
                english1=float(english1)
            if other == None or str(other) == '':
                other=None
            else:
                other=float(other)
            if other1 == None or str(other1) == '':
               
                other1=None
            else:
                other1=float(other1) 
        

            

            condition = [ ( int(student_mobile) != int(student_mobile1) ) , (student_name != student_name1  ) , (parent_mobile != parent_mobile1 ) , ( str(gender) != str(gender1)  ) , ( str(year) != str(year1)  ) , (educational_system != educational_system1 ) , ( str(school) != str(school1) ) , (str(email) != str(email1) ) , (str(source) != str(source1) ) , (status != status1 ) , ( str(recall_date) != str(recall_date1) ) , ( str(not_interested_notes) !=  str(not_interested_notes1) ) , ( str(deposit) != str(deposit1)  )  , (str(trial) != str(trial1) ) , ( str(math) != str(maths1) ) , ( str(english) != str(english1)  ) , ( str(other) != str(other1) ) , ( str(edu_student_id) != str(edu_student_id1) ) ]

            FE_course = course_list
            BE_course = course1.split(",")
            
            course_matched=True
            if int(len(FE_course)) == int(len(BE_course)) :
                for items in FE_course:
                    if items not in BE_course:
                        course_matched == False
                        
                        break
            else:
                course_matched == False

            
            
            
            if any(condition) or not course_matched  or not assignation_flag_matched or (len(add_course_status) > 0 ) or (len(delete_course_status) > 0) :
                print(condition)

                
                cur.execute("select recall_date,done from american_leads where student_id=%s",(student_id,))
                (recall_date_sql,done_sql,)=cur.fetchone()
                if str(recall_date) != str(recall_date_sql):
                        done = "0"
                else:
                        done = done_sql
                
            
                cur.execute("update american_leads set student_mobile=%s,student_name=%s,parent_mobile=%s,gender=%s,year=%s,educational_system=%s,course=%s,school=%s,email=%s,source=%s,status=%s,recall_date=%s,not_interested_notes=%s,deposit=%s,done=%s,trial=%s,maths=%s,english=%s,other=%s,edu_system_id=%s  where student_id=%s",(int(student_mobile),student_name,parent_mobile,gender,year,educational_system,course,school,email,source,status,recall_date,not_interested_notes,deposit,done,trial,math,english,other,edu_student_id,student_id,))
                
                conn.commit()

                if (len(add_course_status) > 0 ):
                    
                    for crse_status_item in add_course_status:
                        exist_course_count=cur.execute("select id from course where course=%s",(crse_status_item,))
                        if int(exist_course_count) == 1:
                            (id_course,)=cur.fetchone()
                        else:
                            id_course = None
                        cur.execute("INSERT into course_status (course_id,course,status,student_id) VALUES (%s,%s,%s,%s)",(id_course,crse_status_item,'pending',student_id,))
                    conn.commit()
                if (len(delete_course_status) > 0):
                    for crse_name_item in delete_course_status:
                        cur.execute("delete from course_status where course=%s and student_id=%s",(crse_name_item,student_id,))
                    conn.commit()

                if not assignation_flag_matched :
                    cur.execute("delete from assignation where student_id=%s",(student_id,))
                    conn.commit()
                    add_assignation(assigned_to_list,student_id,student_mobile,"American",False)
                else:
                    for usernames in assigned_to_list:
                        xx=cur.execute("select user_id from user where username=%s",(usernames,))
                        if int(xx) > 0:
                            (user_idss,)=cur.fetchone()
                            if (user_idss) != session['id']:
                                add_notifications(usernames,user_idss,student_id,"Course Lead Updated","One of the course leads which assigned to you updated")

                add_notes(student_id,student_mobile,notes)
                cur.close()
                conn.close()
                return jsonify({"state":"success","reason":"Lead updated successfully"})

            else:
                add_notes(student_id,student_mobile,notes)
                for usernames in assigned_to_list:
                        xx=cur.execute("select user_id from user where username=%s",(usernames,))
                        if int(xx) > 0:
                            (user_idss,)=cur.fetchone()
                            if (user_idss) != session['id']:
                                add_notifications(usernames,user_idss,student_id,"Course Lead Updated","Notes Updated")
                cur.close()
                conn.close()
                return jsonify({"state":"success","reason":"Notes Only Updated"})

    if request.method == 'GET' and 'student_data' in request.args:
        student_data = request.args['student_data']
        return render_template("update_american_lead.html", student_data=student_data)
    else:
        return render_template("update_american_lead.html", student_data="")


@app.route('/create_course_lead', methods=["GET","POST"])
def create_course_lead():
    if session['name'] == 'External Course Form' or session['id'] == 0 or session['role'] == 'ExternalUser':
                return 'Not Authorized'
    if request.method == 'POST' and 'add_lead':
        
        student_mobile=int(request.form['student_mobile'])
        student_name=request.form['student_name']
        parent_mobile=request.form['parent_mobile']
        try:
            gender=request.form['gender']
        except:
            gender = ""
        try:
            application=request.form['application']
            college = ''
       
            
            if int(application) == 1:
                college = request.form.getlist('college[]')
                college.sort()
                college = ' , '.join(college)
            
        except Exception as e:
            
            application = None
            college = ''
        
        try:
            deposit=request.form['deposit']
        except:
            deposit = None
        try:
            english=request.form['english']
        except:
            english = None
        try:
            semester=request.form['semester']
        except:
            semester = ""

        grade=request.form['grade']
        educational_system=request.form['educational_system']
        school=request.form['school']
        email=request.form['email']
        
        source=request.form['source']
        
        status=request.form['status']
        notes=request.form['notes']
        paid_semester=request.form['paid_semester']
        
       
        if status == 'Interested' :
            recall_date=request.form['recall_date']
            if str(recall_date) == "":
                recall_date = None
        else:
            recall_date = None
        added_by=session['name']
        assigned_to=request.form['assigned_to']
        system_section='Manual Create Lead'
        response={}
        #function_response=creating_lead(student_mobile,student_name,parent_mobile,gender,grade,educational_system,school,email,semester,source,status,recall_date,english,application,college,deposit,added_by,notes,system_section,assigned_to,once_english_flag,paid_semester)
        #return jsonify(function_response)


    return render_template("create_course.html")

@app.route('/update_event_lead', methods=["GET", "POST"])
def update_event_lead():
    """Save one event, or render the client page.

    A lead used to be a client and a single event in one row, so this handler
    wrote both at once. Now the client's own details and each event are saved
    separately, and this is the event half.
    """
    if request.method == 'POST' and 'update_event_lead' in request.args:
        try:
            event_id  = int(request.form['event_id'])
            client_id = int(request.form['client_id'])
        except (KeyError, TypeError, ValueError):
            return jsonify({'state': 'error', 'reason': 'Missing event.'})

        status = request.form.get('status', '')

        # Only the field the status calls for is read; the other is not posted
        # at all, because the page disables it.
        recall_date = None
        not_interested_notes = ""
        if status == 'not_interested':
            not_interested_notes = request.form.get('not_interested_notes', '')
            if not not_interested_notes:
                return jsonify({'state': 'error', 'reason': 'A reason is required to close a lead.'})
        elif status in ('pending', 'not_contacted'):
            recall_date = request.form.get('recall_date') or None
            if recall_date is None:
                return jsonify({'state': 'error', 'reason': 'A recall date is required.'})

        deposit_flag = request.form.get('deposit_flag', '0')
        if str(deposit_flag) == '1':
            deposit   = request.form.get('deposit', '0')   or '0'
            total     = request.form.get('total', '0')     or '0'
            remaining = request.form.get('remaining', '0') or '0'
        else:
            deposit = total = remaining = '0'

        notes = request.form.get('notes', '').strip()
        if not notes:
            return jsonify({'state': 'error', 'reason': 'A note is required on every save.'})

        assigned_to  = request.form.getlist('assigned_to[]')
        check_list   = request.form.getlist('check_box')
        check_hidden = request.form.getlist('check_box_hidden')

        conn, cur = connection()
        try:
            cur.execute("SELECT client_id FROM event_event WHERE event_id = %s", (event_id,))
            row = cur.fetchone()
            if row is None or int(row[0]) != client_id:
                return jsonify({'state': 'error', 'reason': 'That event does not belong to this client.'})

            cur.execute(
                "UPDATE event_event SET event_name = %s, status = %s, temperature = %s,"
                " recall_date = %s, not_interested_notes = %s, payment_status = %s,"
                " deposit_flag = %s, deposit = %s, total = %s, remaining = %s,"
                " assets_list = %s, modified_date = NOW(), modified_by = %s"
                " WHERE event_id = %s",
                (request.form.get('event_name', 'Event')[:128], status,
                 request.form.get('temperature', 'hot'), recall_date,
                 not_interested_notes, request.form.get('payment_status', 'pending'),
                 deposit_flag, deposit, total, remaining,
                 request.form.get('assets_list', ''), session['name'], event_id))

            # The client's own details ride along on the same save.
            cur.execute(
                "UPDATE event_client SET client_name = %s, client_mobile = %s,"
                " client_email = %s, modified_date = NOW(), modified_by = %s"
                " WHERE client_id = %s",
                (request.form.get('client_name', ''), request.form.get('client_mobile', ''),
                 request.form.get('email', ''), session['name'], client_id))

            # Checklist: replace wholesale, as before. check_box carries the
            # ticked items, check_box_hidden every item that is on the list, so
            # the two together say which are unticked rather than removed.
            cur.execute("DELETE FROM event_check_list WHERE event_id = %s", (event_id,))
            for item in check_hidden:
                cur.execute(
                    "INSERT INTO event_check_list (client_id, event_id, item, checked)"
                    " VALUES (%s, %s, %s, %s)",
                    (client_id, event_id, item, 1 if item in check_list else 0))

            cur.execute("SELECT username FROM event_assignation WHERE event_id = %s", (event_id,))
            already = {r[0] for r in cur.fetchall()}
            for username in assigned_to:
                if username in already:
                    continue
                cur.execute("SELECT user_id FROM user WHERE username = %s", (username,))
                u = cur.fetchone()
                cur.execute(
                    "INSERT INTO event_assignation (client_id, event_id, user_id, username,"
                    " client_mobile) VALUES (%s, %s, %s, %s, %s)",
                    (client_id, event_id, int(u[0]) if u else None, username,
                     request.form.get('client_mobile', '')))
            for username in already - set(assigned_to):
                cur.execute("DELETE FROM event_assignation WHERE event_id = %s AND username = %s",
                            (event_id, username))

            conn.commit()
        except Exception as exc:
            conn.rollback()
            app.logger.exception('update_event_lead failed')
            return jsonify({'state': 'error', 'reason': 'The event was not saved.'})
        finally:
            cur.close()
            conn.close()

        add_event_notes(client_id, request.form.get('client_mobile', ''), notes, event_id)

        return jsonify({'state': 'success', 'reason': 'Event saved.'})

    return render_template("update_event_lead.html",
                           client_id=request.args.get('client_id', ''),
                           event_id=request.args.get('event_id', ''))


def add_event_notes(client_id, client_mobile, notes, event_id=None):
    collection, client = get_event_mongo()
    date_now_mongo = datetime.datetime.now()
    added_datetime_standard_mongo = date_now_mongo.strftime("%Y-%m-%d %H:%M:%S")
    added_datetime_mongo = date_now_mongo.strftime("%Y-%m-%d %I:%M %p")
    doc = {"client_id": int(client_id), "client_mobile": client_mobile,
           "notes": notes, "added_date": added_datetime_mongo,
           'added_date_standard': added_datetime_standard_mongo,
           "added_by": session['name']}
    # client_id is kept alongside so the older notes and the new ones have the
    # same shape, but the event is what the log is keyed on.
    if event_id is not None:
        doc["event_id"] = int(event_id)
    collection.insert_one(doc)
    client.close()




#### FILE UPLOAD , DELETE and FETCH #######
@app.route('/get_client_file', methods=['GET','POST'])
def get_client_file():
    client_id = request.form['client_id']
    try:
        conn,cur=connection()
        
        cur.execute("select file_name FROM event_event WHERE event_id=%s",
                    (request.form.get('event_id'),))
        (file_name,)=cur.fetchone()

        if file_name == None:
            return jsonify('no_file')

        return jsonify(file_name)
    except Exception as e:
        print(e)
        return jsonify('error')

@app.route('/upload_file_event', methods=['GET','POST'])
def upload_file_event():
    try:
        client_id = request.form['client_id']
        event_id  = int(request.form['event_id'])

        # One file per event, so anything already there for this event goes.
        files = glob.glob('/projects/51_apps/51_american_crm_nginx_clone/static/'
                          'event_upload_files/event_id_' + str(event_id) + '.*')
        for f in files:
            os.remove(f)

        files = request.files.getlist('files[]')
        print(files[0].filename)
        try:
            file_extension = re.search('(\.[A-Za-z0-9]+)$', files[0].filename).group(1)
            # (\..+?)$
        except AttributeError:
            # Extension not found in the original string
            file_extension = '' # apply your error handling

        print(file_extension)

        for file in files:
            if file.filename != '':
                print("Lamda")
                print(file.name)
                #filename = secure_filename(file.filename)
                # Named after the event, not the client: a client can have
                # several events and each carries its own file.
                file_name = 'event_id_' + str(event_id) + file_extension
                path = '/projects/51_apps/51_american_crm_nginx_clone/static/event_upload_files'
                
                try:
                    file.save(path+'/'+file_name)

                    conn,cur=connection()
                    cur.execute("UPDATE event_event set file_name = %s WHERE event_id = %s",
                                (file_name, event_id,))
                    conn.commit()
                    cur.close()
                    conn.close()
                    return "Success"

                except:
                    return "Failed"

            else:
                filename="NO FILE"
                file_name="NO FILE"
                print("No files in Upload file loop")
                #return "No_Files"
    except Exception as e:
        print(e)
        return "Failed"

@app.route('/file_delete', methods=["GET","POST"])
def file_delete():
    event_id = request.form.get('event_id') or ''

    try:
        files = glob.glob('/projects/51_apps/51_american_crm_nginx_clone/static/'
                          'event_upload_files/event_id_' + str(int(event_id)) + '.*')
        for f in files:
            os.remove(f)

        conn,cur=connection()
        cur.execute("UPDATE event_event set file_name = NULL WHERE event_id = %s", (event_id,))
        conn.commit()
        cur.close()
        conn.close()
        return "Success"

    except:
        return "Failed"

##############################################################################################################################
@app.route('/logout', methods=["GET","POST"])
def logout():
    session.clear()
    return redirect(url_for('login'))


@app.route('/register', methods=["GET","POST"])
def register():
    if session['name'] == 'External Course Form' or session['id'] == 0 or session['role'] == 'ExternalUser':
                return 'Not Authorized'
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        email = request.form['email']
        mobile = request.form['mobile']
        conn,cur=connection()
        x=cur.execute("select username from user where mobile=%s",(mobile,))
        if int(x) > 0:
            return jsonify({'state':'mobile_exist'})
        else:
            print("Trying to Register User")
            
           
            conn, cur = connection()
            try:
                cur.execute("INSERT INTO user (username,password,email,mobile) VALUE(%s,%s,%s,%s)", (username,password,email,mobile,))


                conn.commit()

                return jsonify({'state':'success'})

            except Exception as e:
                print(e)
                return jsonify({'state':'fail'})
        cur.close()
        conn.close()

    return render_template("register.html")

@app.route('/login/', methods=["GET","POST"])
@app.route('/', methods=["GET","POST"])
def login():


    try:
        if session['name'] and session['role']:
                #session['name']='External Course Form'
                #session['id']=0
                #session['role'] = 'ExternalUser'
            if session['name'] == 'External Course Form' or session['id'] == 0 or session['role'] == 'ExternalUser':
                return 'Not Authorized'
            else:

                return redirect(url_for('home'))
    except:
        pass

    error = ''
    error1 = ''
    #try:
    if request.method == "POST":
            
            username = request.form['username']
            
            password = request.form['password']

            
            conn, cur = connection()

            x = cur.execute("SELECT * FROM user WHERE username=(%s)", (username,))
            
            if int(x) == 0:
                error = 'User Not found'
            elif int(x) > 0:
                conn, cur = connection()

                cur.execute("SELECT username, password, theme, role, user_id FROM user WHERE username=(%s)", (username,))
                row = cur.fetchone()
                print(row)
                if (password) == (row[1]):

                    session['name'] = row[0]
                    session['theme'] = row[2]
                    session['role'] = row[3]
                    session['id'] = row[4]

                    return redirect(url_for('home'))

                else:
                    error1 = 'Wrong password'
    return render_template("login.html", error= error, error1=error1)

if __name__== '__main__':
    app.jinja_env.auto_reload = True
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.run(host='0.0.0.0', port=4000, debug=True)