import time

import pandas as pd
import streamlit as st
from streamlit_extras.add_vertical_space import add_vertical_space
from pandas import DataFrame

from models.chapter import *
from models.course import get_courses_by_user
from tools.auth import login

# ==================== 各种初始化工作 ====================
# 设置页面标题和图标
st.set_page_config(
    page_title="Chapters Setting",
    page_icon="🧙‍♂️",
)

'# 课程章节管理 📚📜📚 '
"""
> 将飞书中的章节（数据表）更新至 C端环境
"""
st.caption('章节类型：401-体验课； 402-正式课； 405-隐藏分支课')



@st.dialog('➕ 添加 章节剧本文档')
def add_chapter(max_index_now, base_url):
    with st.form('edit_row'):
        params = {
            'name': st.text_input('章节名称'),
            'lark_table_id': st.text_input('飞书表格 ID'),
            'lark_view_id': st.text_input('飞书表格 ViewID', value=cfg.DEF_LARK_VIEW_ID),
            'chapter_type': LESSON_TYPES[st.selectbox('章节类型', list(LESSON_TYPES.keys()), index=1)],
            'id': st.number_input('lesson_no(index)', value=max_index_now + 1, step=1),
        }

        submit_button = st.form_submit_button('提交修改', type='primary', use_container_width=True)
        if submit_button:
            update_chapter_from_api(
                params['lark_table_id'],
                params['lark_view_id'],
                params['name'],
                params['id'],
                params['chapter_type'],
                base_url
            )
            st.rerun()


@st.dialog('✏️ 修改 章节剧本文档')
def edit_chapter(df: DataFrame, chapter_id, base_url):
    with st.form('edit_row'):
        params = {
            'name': st.text_input('章节名称', df.loc[chapter_id, 'name']),
            'lark_table_id': st.text_input('飞书表格 ID', df.loc[chapter_id, 'lark_table_id']),
            'lark_view_id': st.text_input('飞书表格 ViewID', df.loc[chapter_id, 'lark_view_id']),
            'chapter_type': st.text_input('章节类型', df.loc[chapter_id, 'chapter_type']),
            'chapter_id': st.text_input('lesson_no(index)', chapter_id)
        }

        submit_button = st.form_submit_button('提交修改', type='primary', use_container_width=True)
        if submit_button:
            # df.loc[chapter_id] = params
            update_chapter_from_api(
                params['lark_table_id'],
                params['lark_view_id'],
                params['name'],
                params['chapter_id'],
                params['chapter_type'],
                base_url
            )
            st.rerun()


@st.dialog('⚠️ 确认删除吗?')
def delete_chapter(df: DataFrame, chapter_id, base_url):
    with st.form('delete_row'):
        st.text_input('章节名称', df.loc[chapter_id, 'name'], disabled=True)
        table_id = st.text_input('飞书表格 ID', df.loc[chapter_id, 'lark_table_id'], disabled=True)
        st.text_input('飞书表格 ViewID', df.loc[chapter_id, 'lark_view_id'], disabled=True)
        st.number_input('排序权重', value=df.loc[chapter_id, 'rank'], disabled=True)

        submit_button = st.form_submit_button('确认删除', type='primary', use_container_width=True)
        if submit_button:
            delete_chapter_from_api(table_id, base_url)
            st.rerun()


@st.fragment
def stdf_manage(df, title, has_delete=True, base_url=cfg.API_URL):
    st.write(f'### {title}')
    event = st.dataframe(
        df,
        height=None,
        column_order=['id', 'name', 'lark_table_id', 'lark_view_id', 'chapter_type'],
        column_config={
            'id': 'lesson_no',
            'name': '章节名称',
            'lark_table_id': '飞书表格 ID',
            'lark_view_id': '飞书表格 ViewID',
            # 'rank': '排序权重',
            'chapter_type': '章节类型'
        },
        use_container_width=True,
        hide_index=True,
        on_select='rerun',
        selection_mode='single-row',
        key=title + base_url
    )

    if event.selection['rows']:
        selected_chapter = df.iloc[event.selection['rows'][0]]
        # selected_chapter
        # selected_chapter.name

        cols = st.columns(3 if has_delete else 2)
        with cols[0]:
            if st.button(f'⬆️ 更新 {selected_chapter["name"]}', use_container_width=True):
                update_chapter_from_api(
                    table_id=selected_chapter['lark_table_id'],
                    view_id = selected_chapter['lark_view_id'],
                    title=selected_chapter['name'],
                    index=selected_chapter.name,
                    lesson_type=selected_chapter['chapter_type'],
                    base_url=base_url
                )

        with cols[1]:
            if st.button(f'✏️ 修改 {selected_chapter["name"]}', use_container_width=True):
                edit_chapter(df, selected_chapter.name, base_url=base_url)

        if has_delete:
            with cols[2]:
                if st.button(f'❌ 删除 {selected_chapter["name"]}', use_container_width=True):
                    delete_chapter(df, selected_chapter.name, base_url=base_url)


def display_chapter_management(base_url):
    courses = get_courses_by_user(st.session_state["username"])
    # courses = get_courses_by_user_from_sqlite('kenrick')
    if not courses:
        st.warning(' No courses available, please go to `My Account` to create a new course.。  ⬇️ ⬇️ ⬇️', icon='⚠️')
        if st.button('Go to `My Account`', type='primary', use_container_width=True):
            st.switch_page("pages/100_My_Account.py")
        st.stop()
        
    selected_course = st.selectbox('Select Course:', (course for course in courses), key=f'select_course_{base_url}')
    if selected_course:
        
        df_chapters_api = DataFrame([chapter.__dict__ for chapter in load_chapters_from_api(doc_id=selected_course.lark_app_token, base_url=base_url)])

        if st.button('⬆️🔄 批量全部更新 🔄⬆️', type='primary', use_container_width=True, key=f'update_{base_url}'):
            for index, row in df_chapters_api.iterrows():
                update_chapter_from_api(
                    table_id=row['lark_table_id'],
                    view_id=row['lark_view_id'],
                    title=row['name'],
                    index=row['id'],
                    lesson_type=row['chapter_type'],
                    base_url=base_url
                )
                time.sleep(0.1)
            st.success('批量更新完成', icon='🎉')

        max_index = int(df_chapters_api['id'].max() if not df_chapters_api.empty else -1)

        # df_chapters_api 为空的时候显示提示
        if df_chapters_api.empty:
            st.warning('暂无章节')
            df_chapters_api = pd.DataFrame(columns=['id', 'name', 'lark_table_id', 'lark_view_id', 'chapter_type'])
        # else:
        # 提取出体验章节， chapter_type == 401
        df_chapters_trial = df_chapters_api[df_chapters_api['chapter_type'] == 401]
        df_chapters_trial.set_index('id', inplace=True)

        # 提取出正式章节， chapter_type == 402
        df_chapters_norm = df_chapters_api[df_chapters_api['chapter_type'] == 402]
        df_chapters_norm.set_index('id', inplace=True)

        # 提取出分支章节， chapter_type == 405
        df_chapters_hidden = df_chapters_api[df_chapters_api['chapter_type'] == 405]
        df_chapters_hidden.set_index('id', inplace=True)


        stdf_manage(df_chapters_trial, '体验章节配置', has_delete=False, base_url=base_url)
        stdf_manage(df_chapters_norm, '正式章节配置', base_url=base_url)
        stdf_manage(df_chapters_hidden, '隐藏分支章节配置', base_url=base_url)

        '-----'
        if st.button(f'➕ 添加章节', use_container_width=True, key=f'add_chapter_{base_url}'):
            add_chapter(max_index, base_url=base_url)


# 需要登录
with login():

    tab1, tab2 = st.tabs(['测试环境', '正式环境'])
    
    with tab1:
        '## 👩🏻‍🎓 测试环境 章节配置'
        display_chapter_management(cfg.API_URL_TEST)
    
    with tab2:
        '## ⚠️ 警告！这是正式环境，请谨慎操作！ ⚠️'
        display_chapter_management(cfg.API_URL_PROD)


# Avoid losing already activated tabs after rerun.
if "initial_rerun_done" not in st.session_state:
    st.session_state.initial_rerun_done = True
    st.rerun()
