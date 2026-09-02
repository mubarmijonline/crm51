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


@app.before_request
def before_request():
    #print("Wakanda")
    #print(request.endpoint)
    if 'name' not in session and request.endpoint != 'login' and request.endpoint != 'register' and request.endpoint != 'static' and request.endpoint != 'course_form' and request.endpoint != 'get_form_course_data' and request.endpoint != 'get_educational_system_data':

        print(request.endpoint)
        print(request.method)
        print(request.data)
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
        tt=cur.execute("SELECT client_mobile FROM event_leads WHERE client_id=%s",(client_id,))
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
                    x=cur.execute('select client_id, client_name, client_mobile from event_leads where client_id=%s',(client_id,))

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
        
        Query="SELECT client_id, client_mobile, client_name FROM event_leads"

        
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
            
            client_id = request.form['client_id']

            cur.execute("select done from event_leads where client_id=%s",(client_id,))
            (done,)=cur.fetchone()
            if str(done) == "1":
                done = "0"
            else:
                done="1"

            Query="update event_leads set done = "+str(done)+" where client_id="+client_id
            cur.execute(Query)
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
            
            client_count  = cur.execute("select client_id from event_leads where client_mobile=%s",(int(client_mobile),))
            if int(client_count) > 0 :
                (exist_client_id,)=cur.fetchone()
                cur.close()
                conn.close()

                return {'state':'error','reason':'client already exists in DB with ID = '+str(exist_client_id)}

            else:

                cur.execute("INSERT INTO event_leads(client_mobile, client_name, client_email, status, client_not_interested_notes, recall_date, client_deposit_flag, client_deposit, client_assets_list, added_by, client_payment_status) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s, %s)",(client_mobile, client_name, client_email, status, str(not_interested_notes), recall_date, client_deposit_flag, client_deposit, assets_list, str(session['name']),client_payment_status,))
                conn.commit()
                cur.execute("select client_id from event_leads where client_mobile=%s and client_id=(SELECT LAST_INSERT_ID())",(client_mobile,))
                (client_id,)=cur.fetchone()

                assi_feedback=add_event_assignation(assigned_to,client_id,client_mobile, True)

                for item in check_list:
                    cur.execute("INSERT INTO event_check_list (client_id, item, checked) VALUES (%s, %s, %s)",(client_id, item, 1))
                for item in check_list_hidden:
                    cur.execute("INSERT INTO event_check_list (client_id, item, checked) VALUES (%s, %s, %s)",(client_id, item, 0))

                if assi_feedback != 'success':
                    cur.execute("delete from event_leads where client_id=%s and client_mobile=%s",(client_id,client_mobile,))
                    cur.execute("delete from event_assignation where client_id=%s and client_mobile=%s",(client_id,client_mobile,))
                    cur.execute("delete from event_check_list where client_id=%s",(client_id,))

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

def add_event_assignation(assigned_to, client_id, client_mobile, create_notifcation_flag):
    
    if len(assigned_to) == 0:

        return 'failed'
    conn,cur=connection()
    try:

        for username in assigned_to:
            check_if_already_assigend = cur.execute("select client_id from event_assignation where client_mobile=%s AND username = %s",(int(client_mobile), username,))
            if int(check_if_already_assigend) > 0:
                continue # already assigned

            cur.execute("select user_id from user where username=%s",(username,))
            (user_id,)=cur.fetchone()
            cur.execute("INSERT into event_assignation(user_id, client_id, client_mobile, username) VALUES (%s,%s,%s,%s)",(user_id,client_id,int(client_mobile),username,))
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
    client_id = request.form['client_id']

    conn, cur = connection()
    try:
        x=cur.execute("select role from user where username=%s",(session['name'],))
        if int(x) == 0:
            return jsonify({'state':'failed'})
        else:
            (role,)=cur.fetchone()
            if role.lower() == 'admin':
                Query="DELETE FROM event_leads WHERE client_id = "+str(client_id)+";"
                cur.execute(Query)

                Query="DELETE FROM event_assignation WHERE client_id = "+str(client_id)+";"
                cur.execute(Query)

                Query="DELETE FROM event_check_list WHERE client_id = "+str(client_id)+";"
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

#### END EVENT #######

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
    client_id = request.args['id']  
    json_data=[]
    collection,client = get_event_mongo()
    for x in collection.find({"client_id":int(client_id)}).sort("added_date_standard",-1):
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

        if username_role == 'admin':
            cur.execute("select count(*) as total_assigned_lead from event_leads ")
            (total_assigned_lead,)=cur.fetchone()

            cur.execute("select ifnull(count(*),0) as total_assigned_lead_unfinished from event_leads where status = 'pending' or status = 'not_contacted' ")
            (total_assigned_lead_unfinished,)=cur.fetchone()

            cur.execute("select ifnull(count(*),0) as total_assigned_lead_finished from event_leads where status = 'not_interested' ")
            (total_assigned_lead_finished,)=cur.fetchone()

            cur.execute("select ifnull(count(*),0) as total_assigned_lead_finished_enrol from event_leads  where status = 'enrol' ")
            (total_assigned_lead_finished_enrol,)=cur.fetchone()
        else:

            cur.execute("select count(*) as total_assigned_lead from event_leads where client_id in ( select client_id from event_assignation where username=%s)",(username_profile,))
            (total_assigned_lead,)=cur.fetchone()

            cur.execute("select ifnull(count(*),0) as total_assigned_lead_unfinished from event_leads where client_id in ( select client_id from event_assignation where username=%s) and status = 'pending' or status = 'not_contacted' ",(username_profile,))
            (total_assigned_lead_unfinished,)=cur.fetchone()

            cur.execute("select ifnull(count(*),0) as total_assigned_lead_finished from event_leads where client_id in ( select client_id from event_assignation where username=%s) and status = 'not_interested' ",(username_profile,))
            (total_assigned_lead_finished,)=cur.fetchone()

            cur.execute("select ifnull(count(*),0) as total_assigned_lead_finished_enrol from event_leads where client_id in ( select client_id from event_assignation where username=%s) and status = 'enrol' ",(username_profile,))
            (total_assigned_lead_finished_enrol,)=cur.fetchone()

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
            Query= "select client_id, client_mobile, client_name, if(done, 'yes', 'no') as done , (select GROUP_CONCAT(username)  from event_assignation where a.client_id=client_id) as assigned_username from event_leads as a where  recall_date = '"+date+"'"
        else:
            Query= "select client_id, client_mobile, client_name, if(done, 'yes', 'no') as done, (select GROUP_CONCAT(username)  from event_assignation where a.client_id=client_id) as assigned_username from event_leads as a where client_id in (select client_id from event_assignation where user_id="+str(user_id)+") and  recall_date = '"+date+"'"

        cur.execute(Query)
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


def _build_search(term, columns, phone_columns):
    """One search term -> (sql_fragment, params). OR across every column."""
    parts, params = [], []
    like = '%' + _escape_like(term) + '%'

    for col, (searchable, _) in columns.items():
        if not searchable:
            continue
        parts.append("`%s` LIKE %%s" % col)
        params.append(like)

    for col in phone_columns:
        for variant in _phone_variants(term):
            parts.append("%s LIKE %%s" % _digits_only_sql('`%s`' % col))
            params.append('%' + variant + '%')

    if not parts:
        return None, []
    return '(' + ' OR '.join(parts) + ')', params


def _datatables_query(table, columns, phone_columns, request, base_where=None):
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
            order_parts.append('`%s` %s' % (name, direction))
        i += 1
    order_sql = ' ORDER BY ' + ', '.join(order_parts) if order_parts else ''

    conn, cur = connection()
    try:
        if base_where:
            cur.execute('SELECT COUNT(*) FROM `%s` WHERE %s' % (table, base_where))
        else:
            cur.execute('SELECT COUNT(*) FROM `%s`' % table)
        total = cur.fetchone()[0]

        if where_sql:
            cur.execute('SELECT COUNT(*) FROM `%s`%s' % (table, where_sql), tuple(params))
            filtered = cur.fetchone()[0]
        else:
            filtered = total

        select_cols = ', '.join('`%s`' % c for c in columns)
        cur.execute(
            'SELECT %s FROM `%s`%s%s LIMIT %%s OFFSET %%s'
            % (select_cols, table, where_sql, order_sql),
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


EVENT_LEAD_COLUMNS = {
    'client_id':             (True,  True),
    'client_name':           (True,  True),
    'client_mobile':         (True,  True),
    'client_email':          (True,  True),
    'status':                (True,  True),
    'client_payment_status': (True,  True),
    'client_deposit_flag':   (False, True),
    'client_deposit':        (False, True),
    'done':                  (False, True),
    'added_by':              (True,  True),
    'added_date':            (False, True),
    'modified_by':           (True,  True),
    'modified_date':         (False, True),
}

EVENT_PHONE_COLUMNS = ('client_mobile',)


@app.route('/api/event_leads', methods=["GET", "POST"])
def api_event_leads():
    # Same visibility as /get_all_event_lead_data.
    if 'name' not in session:
        return jsonify({'error': 'not_authenticated'}), 401
    payload = _datatables_query('event_leads', EVENT_LEAD_COLUMNS,
                                EVENT_PHONE_COLUMNS, request)
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
    payload = _datatables_query('event_leads', EVENT_LEAD_COLUMNS,
                                EVENT_PHONE_COLUMNS, request,
                                base_where="`status` IN ('pending','not_contacted')")
    return app.response_class(json.dumps(payload, default=str),
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

@app.route('/update_event_lead', methods=["GET","POST"])
def update_event_lead():
    if request.method == 'POST' and 'update_event_lead' in request.args :
        try:
            print(request.form)
            
            client_id=request.form['client_id']
            client_mobile=int(request.form['client_mobile'])
            client_name=request.form['client_name']

            client_email = request.form['email']

            try:
                deposit=request.form['deposit']
            except:
                deposit = 0

            status=request.form['status']

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
            if client_deposit_flag == "1":
                client_deposit = request.form['client_deposit']
                print("Client Deposit "+str(client_deposit))
                
                if str(client_deposit) == "" or client_deposit == None :
                    return jsonify({"state":"error","reason":"Kindly add Deposit Amount to continue"})
                
                client_remaining = request.form['client_remaining']
                client_total = request.form['client_total']

            else: 
                client_deposit = 0
                client_remaining = 0
                client_total = 0

            client_payment_status = request.form['client_payment_status']
            try:
                temperature = request.form['temperature']
            except:
                temperature = ""

            ### CHECK LIST ###
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
            
            assigned_to_list = request.form.getlist('assigned_to[]')
            print("#################################################")
            print("Assign List from Frontend: "+str(assigned_to_list))
            print("#################################################")

            if assigned_to_list == '' or assigned_to_list == None:
                return {'state':'error','reason':'Assignation list cannot be empty!'}

            conn,cur=connection()

            cur.execute("DELETE FROM event_check_list WHERE client_id = %s", (client_id,))  ### delete all items from DB and start fresh
            conn.commit()

            for item in check_list:
                cur.execute("INSERT INTO event_check_list (client_id, item, checked) VALUES (%s, %s, %s)",(client_id, item, 1))
            for item in check_list_hidden:
                cur.execute("INSERT INTO event_check_list (client_id, item, checked) VALUES (%s, %s, %s)",(client_id, item, 0))
            conn.commit()

            client_assets_list = request.form['assets_list']

            notes = request.form['notes']

            done="0"

            ### First Check if client mobile already exists or not:
            x=cur.execute("select client_id, client_name from event_leads where client_mobile=%s and client_id != %s",(client_mobile,client_id,))
            if int(x) > 0:
                (exist_client_id,exist_client_name)=cur.fetchone()
                return jsonify({"state":"error","reason":"Mobile Number already exists with ID: "+ str(exist_client_id)+ " ,Name: " + str(exist_client_name)})
           
            else:
                cur.execute("SELECT * FROM event_leads where client_id=%s",(client_id,))
                returned_row=cur.fetchone()
                print(returned_row)

                #if session['role'] != 'admin':
                #    return jsonify({"state":"error","reason":"You do not have access to alter lead assignation"})

                if session['role'] == 'admin':

                    #### CLear all event asisgnation for said client_id to avoid any overwrites ####
                    cur.execute("DELETE FROM event_assignation WHERE client_id = %s",(client_id,))
                    conn.commit()

                    ### Loop Users in list from Front End ###
                    for user in assigned_to_list:
                        print(str(user) + " 1st Loop")
                        try:
                            cur.execute("INSERT INTO event_assignation (client_id, user_id, username, client_mobile) VALUES (%s,(SELECT user_id FROM user WHERE username = %s),%s,%s)",(client_id, user, user,client_mobile,))
                            conn.commit()
                            add_event_assignation(assigned_to_list,client_id,client_mobile,False)

                        except Exception as e:
                            print(e)
                            print("Could not Insert "+str(user)+" , probably duplicate")

                ### MAIN UPDATE QUERY ###
                cur.execute("UPDATE event_leads set client_mobile=%s, client_name=%s, client_email=%s, status=%s, recall_date=%s, client_not_interested_notes=%s, client_deposit_flag=%s, client_deposit=%s, client_remaining=%s, client_total=%s, client_payment_status=%s, client_assets_list=%s, modified_by=%s, modified_date=CURRENT_TIMESTAMP, temperature=%s WHERE client_id=%s",(int(client_mobile),client_name,client_email,status,recall_date,not_interested_notes,client_deposit_flag,client_deposit,client_remaining,client_total,client_payment_status,client_assets_list,str(session['name']),temperature,client_id,))                    
                conn.commit()

                for usernames in assigned_to_list:
                    xx=cur.execute("select user_id from user where username=%s",(usernames,))
                    if int(xx) > 0:
                        (user_idss,)=cur.fetchone()
                        if (user_idss) != session['id']:
                            add_event_notifications(usernames,user_idss,client_id,"Event Lead Updated","One of the Event leads which are assigned to you, has been updated")

                add_event_notes(client_id,client_mobile,notes)
                cur.close()
                conn.close()
                return jsonify({"state":"success","reason":"Event Lead updated successfully"})
                
        except Exception as e:
            print(e)
            exc_type, exc_obj, exc_tb = sys.exc_info()
            fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
            print(exc_type, fname, exc_tb.tb_lineno)
            return jsonify({"state":"error","reason":"Something went wrong."})


    if request.method == 'GET' and 'client_data' in request.args:
        client_data = request.args['client_data']
        return render_template("update_event_lead.html", client_data=client_data)

    else:
        return render_template("update_event_lead.html", client_data="")

def add_event_notes(client_id,client_mobile,notes):
    collection,client = get_event_mongo()
    date_now_mongo = datetime.datetime.now()
    added_datetime_standard_mongo = date_now_mongo.strftime("%Y-%m-%d %H:%M:%S")
    added_datetime_mongo = date_now_mongo.strftime("%Y-%m-%d %I:%M %p")
    collection.insert_one({"client_id":int(client_id),"client_mobile":client_mobile,"notes":notes,"added_date":added_datetime_mongo,'added_date_standard':added_datetime_standard_mongo,"added_by":session['name'],})
    client.close()




#### FILE UPLOAD , DELETE and FETCH #######
@app.route('/get_client_file', methods=['GET','POST'])
def get_client_file():
    client_id = request.form['client_id']
    try:
        conn,cur=connection()
        
        cur.execute("select file_name FROM event_leads WHERE client_id=%s",(client_id,))
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
        print(client_id)

        # make sure there are no old files #
        files = glob.glob('/projects/51_apps/51_american_crm_nginx_clone/static/event_upload_files/client_id_'+client_id+'*')
        for f in files:
            os.remove(f)
        ####################################

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
                file_name = 'client_id_' +str(client_id)+ file_extension
                path = '/projects/51_apps/51_american_crm_nginx_clone/static/event_upload_files'
                
                try:
                    file.save(path+'/'+file_name)

                    conn,cur=connection()
                    cur.execute("UPDATE event_leads set file_name = %s WHERE client_id = %s",(file_name,client_id,))
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
    client_id=request.form['client_id']

    try:

        files = glob.glob('/projects/51_apps/51_american_crm_nginx_clone/static/event_upload_files/client_id_'+client_id+'*')
        for f in files:
            os.remove(f)

        conn,cur=connection()
        cur.execute("UPDATE event_leads set file_name = NULL WHERE client_id = %s",(client_id,))
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