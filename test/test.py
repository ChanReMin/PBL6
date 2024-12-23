import os, sys;
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))));
from mongoengine import connect
from app.models.admin import Admin
connect('karaokeDB')
from app.models.user import User
# User(username='nhatminh', email='nhatminh@gmail.com', date_of_birth='2003-10-28').set_password('123456').save()
# User(username='nhatminh1', email='nhatminh1@gmail.com', date_of_birth='2003-10-28').set_password('123456').save()
# User(username='nhatminh2', email='nhatminh2@gmail.com', date_of_birth='2003-10-28').set_password('123456').save()
# User(username='nhatminh3', email='nhatminh3@gmail.com', date_of_birth='2003-10-28').set_password('123456').save()
# User(username='nhatminh4', email='nhatminh4@gmail.com', date_of_birth='2003-10-28').set_password('123456').save()
# User(username='nhatminh5', email='nhatminh5@gmail.com', date_of_birth='2003-10-28').set_password('123456').save()
# User(username='nhatminh6', email='nhatminh6@gmail.com', date_of_birth='2003-10-28').set_password('123456').save()
# User(username='nhatminh7', email='nhatminh7@gmail.com', date_of_birth='2003-10-28').set_password('123456').save()
# User(username='nhatminh8', email='nhatminh8@gmail.com', date_of_birth='2003-10-28').set_password('123456').save()
# User(username='nhatminh8', email='nhatminh8@gmail.com', date_of_birth='2003-10-28').set_password('123456').save()
Admin(username='admin', name='Admin').set_password('123456').save()