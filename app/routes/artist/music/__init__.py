from flask import Blueprint, flash, redirect, render_template, request, url_for

from app.decorators import login_required
from app.models.music import Music
from app.routes.forms.add_music_form import AddMusicForm
from models.enum.account_role import AccountRole

artist_music_bp = Blueprint('music', __name__)

DEFAULT_MUSIC_PER_PAGE = 5
MIN_MUSIC_PER_PAGE = 2
MAX_MUSIC_PER_PAGE = 10


@artist_music_bp.route('/add', methods=['GET', 'POST'])
@login_required(role=AccountRole.ARTIST)
def add():
    form = AddMusicForm()

    if form:
        name = form.name.data
        lyric = form.lyrics.data
        uri = form.music_url.data

        new_music = Music(name=name, lyrics=lyric, music_url=uri)
        new_music.save()

        flash('Music added successfully!', 'success')
        return redirect(url_for('music.list'))

    return render_template('admin/music/add.html', form=form)


@artist_music_bp.route('/list', methods=['GET'])
@login_required(role=AccountRole.ARTIST)
def list():
    page = request.args.get('page', 1, type=int)
    limit = max(MIN_MUSIC_PER_PAGE, min(request.args.get('limit', DEFAULT_MUSIC_PER_PAGE, type=int), MAX_MUSIC_PER_PAGE))
    skip_count = (page - 1) * limit
    musics = Music.objects.skip(skip_count).limit(limit)
    total_music_items = Music.objects.count()
    total_pages = (total_music_items + limit - 1) // limit
    return render_template('artist/music/list.html', musics=musics, page=page, limit=limit, total_pages=total_pages)
