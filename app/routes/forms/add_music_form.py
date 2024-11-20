from wtforms import Form, StringField, FieldList, URLField, FormField
from wtforms.validators import DataRequired, URL
# from wtforms_mongoengine.fields import ModelSelectMultipleField
from app.models import artist, genre

class LyricForm(Form):
    text = StringField('Lyric Content')
    start_time = StringField('Start Time')
    end_time = StringField('End Time')

class AddMusicForm(Form):
    name = StringField('Name', validators=[DataRequired()])
    # artists = ModelSelectMultipleField('Artists',
    #                                    query_factory=lambda: artist.Artist.objects,
    #                                    validators=[DataRequired()])
    # genres = ModelSelectMultipleField('Genres',
    #                                   query_factory=lambda: genre.Genre.objects,
    #                                   validators=[DataRequired()])
    music_url = URLField('Music URL', validators=[URL()])
    metric_url = URLField('Metric URL', validators=[URL()])
    lyrics = FieldList(FormField(LyricForm), min_entries=1)
