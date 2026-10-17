<template>
  <q-page class="q-pa-lg">
    <q-card flat class="border-radius-card">
      <q-card-section>
        <div class="text-h6">لیست تیکت ها</div>
      </q-card-section>
      <q-tabs
        v-model="tab"
        class="text-grey-9"
        active-color="primary"
        align="center"
        narrow-indicator
      >
        <q-tab name="undone"  label="فعالیت های انجام نشده" />
        <q-tab name="doing"  label="فعالیت های در حال انجام" />
        <q-tab name="done"  label="فعالیت های انجام شده" />
      </q-tabs>
      <q-card-section>

        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="undone">
            <q-table
              binary-state-sort
              :loading="loading"
              :rows="rows"
              flat bordered class="border-radius-table"
              :filter="filter"
              :columns="columns"
              row-key="id"
              :rows-per-page-options="[10]"
            >


              <template v-slot:loading>
                <q-inner-loading showing color="primary"/>
              </template>

              <template v-if="$q.screen.gt.md" v-slot:top-right="props">
                <div class="q-gutter-x-sm">

                  <q-btn
                    color="info"
                    :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
                    @click="props.toggleFullscreen"
                  />
                  <q-btn
                    color="negative"
                    icon-right="archive"
                    @click="exportTable"/>
                </div>
              </template>


              <template v-slot:body="props">
                <q-tr :props="props">
                  <q-td key="Done" :props="props">
                    <q-btn  @click="acceptRow(props.row)" color="positive" flat
                            icon="eva-checkmark-circle-2-outline" rounded dense/>
                  </q-td>
                  <q-td key="sabtKonande" :props="props">
                    {{props.row.sabtKonande}}
                  </q-td>
                  <q-td key="title" :props="props">
                    {{props.row.title}}
                  </q-td>
                  <q-td key="user" :props="props">
                    {{props.row.anjamDahande}}
                  </q-td>
                  <q-td key="date" :props="props">
                    {{props.row.jalali_full_date}}
                  </q-td>
                  <q-td key="time" :props="props">
                    {{props.row.time}}
                  </q-td>
                  <q-td key="comment" :props="props">
                    <q-btn
                      @click.prevent="showComments(props.row.id)"
                      title="کامنت ها" dense round color="blue" icon="forum">
                      <q-badge v-if="props.row.commentsCount > 0" color="negative" style="font-size: 18px;" floating>
                        {{ props.row.commentsCount }}
                      </q-badge>
                    </q-btn>
                  </q-td>
                  <q-td key="action" :props="props" class="q-gutter-x-sm">

                    <q-btn
                      @click.prevent="showAttachments(props.row.id)"
                      title="پیوست ها" dense round color="teal" icon="attachment">
                      <q-badge v-if="props.row.attachmentsCount > 0" color="negative" style="font-size: 18px;"
                               floating>
                        {{ props.row.attachmentsCount }}
                      </q-badge>
                    </q-btn>

                    <q-btn title="ویرایش" dense round color="yellow-9" icon="edit"
                           size="13px"
                           :to="{ name:'TicketEdit',params:{id:props.row.id} }"/>
                    <q-btn title="حذف" dense round color="negative" icon="delete"
                           size="13px"
                           @click.prevent="deleteConfirmation(props.row.id)"/>
                  </q-td>
                </q-tr>
              </template>


            </q-table>
          </q-tab-panel>
          <q-tab-panel name="doing">
            <q-table
              binary-state-sort
              :loading="loading"
              :rows="rowsDoing"

              :filter="filter"
              :columns="columns"
              row-key="id"
              :rows-per-page-options="[10]"
            >


              <template v-slot:loading>
                <q-inner-loading showing color="primary"/>
              </template>

              <template v-if="$q.screen.gt.md" v-slot:top-right="props">
                <div class="q-gutter-x-sm">

                  <q-btn
                    color="info"
                    :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
                    @click="props.toggleFullscreen"
                  />
                  <q-btn
                    color="negative"
                    icon-right="archive"
                    @click="exportTable"/>
                </div>
              </template>


              <template v-slot:body="props">
                <q-tr :props="props">
                  <q-td key="Done" :props="props">
                    <q-btn  @click="acceptRow(props.row)" color="positive" flat
                            icon="eva-checkmark-circle-2-outline" rounded dense/>
                  </q-td>
                  <q-td key="sabtKonande" :props="props">
                    {{props.row.sabtKonande}}
                  </q-td>
                  <q-td key="title" :props="props">
                    {{props.row.title}}
                  </q-td>
                  <q-td key="user" :props="props">
                    {{props.row.anjamDahande}}
                  </q-td>
                  <q-td key="date" :props="props">
                    {{props.row.jalali_full_date}}
                  </q-td>
                  <q-td key="time" :props="props">
                    {{props.row.time}}
                  </q-td>
                  <q-td key="comment" :props="props">
                    <q-btn
                      @click.prevent="showComments(props.row.id)"
                      title="کامنت ها" dense round color="blue" icon="forum">
                      <q-badge v-if="props.row.commentsCount > 0" color="negative" style="font-size: 18px;" floating>
                        {{ props.row.commentsCount }}
                      </q-badge>
                    </q-btn>
                  </q-td>
                  <q-td key="action" :props="props" class="q-gutter-x-sm">

                    <q-btn
                      @click.prevent="showAttachments(props.row.id)"
                      title="پیوست ها" dense round color="teal" icon="attachment">
                      <q-badge v-if="props.row.attachmentsCount > 0" color="negative" style="font-size: 18px;"
                               floating>
                        {{ props.row.attachmentsCount }}
                      </q-badge>
                    </q-btn>

                    <q-btn title="ویرایش" dense round color="yellow-9" icon="edit"
                           size="13px"
                           :to="{ name:'TicketEdit',params:{id:props.row.id} }"/>
                    <q-btn title="حذف" dense round color="negative" icon="delete"
                           size="13px"
                           @click.prevent="deleteConfirmation(props.row.id)"/>
                  </q-td>
                </q-tr>
              </template>


            </q-table>
          </q-tab-panel>
          <q-tab-panel name="done">
            <q-table
              binary-state-sort
              :loading="loading"
              :rows="rowsDone"

              :filter="filter"
              :columns="columnsDone"
              row-key="id"
              :rows-per-page-options="[10]"
            >


              <template v-slot:loading>
                <q-inner-loading showing color="primary"/>
              </template>

              <template v-if="$q.screen.gt.md" v-slot:top-right="props">
                <div class="q-gutter-x-sm">

                  <q-btn
                    color="info"
                    :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
                    @click="props.toggleFullscreen"
                  />
                  <q-btn
                    color="negative"
                    icon-right="archive"
                    @click="exportTable"/>
                </div>
              </template>


              <template v-slot:body="props">
                <q-tr :props="props">
                  <q-td key="Done" :props="props">
                    <q-btn  @click="acceptRow(props.row)" color="positive" flat
                            icon="eva-checkmark-circle-2-outline" rounded dense/>
                  </q-td>
                  <q-td key="sabtKonande" :props="props">
                    {{props.row.sabtKonande}}
                  </q-td>
                  <q-td key="title" :props="props">
                    {{props.row.title}}
                  </q-td>
                  <q-td key="user" :props="props">
                    {{props.row.anjamDahande}}
                  </q-td>
                  <q-td key="date" :props="props">
                    {{props.row.jalali_full_date}}
                  </q-td>
                  <q-td key="time" :props="props">
                    {{props.row.time}}
                  </q-td>
                  <q-td key="comment" :props="props">
                    <q-btn
                      @click.prevent="showComments(props.row.id)"
                      title="کامنت ها" dense round color="blue" icon="forum">
                      <q-badge v-if="props.row.commentsCount > 0" color="negative" style="font-size: 18px;" floating>
                        {{ props.row.commentsCount }}
                      </q-badge>
                    </q-btn>
                  </q-td>
                  <q-td key="action" :props="props" class="q-gutter-x-sm">
                    <q-btn
                      @click.prevent="showAttachments(props.row.id)"
                      title="پیوست ها" dense round color="teal" icon="attachment">
                      <q-badge v-if="props.row.attachmentsCount > 0" color="negative" style="font-size: 18px;"
                               floating>
                        {{ props.row.attachmentsCount }}
                      </q-badge>
                    </q-btn>

                    <q-btn title="ویرایش" dense round color="yellow-9" icon="edit"
                           size="13px"
                           :to="{ name:'TicketEdit',params:{id:props.row.id} }"/>
                    <q-btn title="حذف" dense round color="negative" icon="delete"
                           size="13px"
                           @click.prevent="deleteConfirmation(props.row.id)"/>
                  </q-td>
                </q-tr>
              </template>


            </q-table>
          </q-tab-panel>
        </q-tab-panels>

      </q-card-section>
    </q-card>


    <q-dialog v-model="deleteConfirmDialog">
      <q-card>
        <q-card-section class="row items-center">
          <span class="q-mr-sm">آیا از حذف این آیتم اطمینان دارید؟</span>
        </q-card-section>

        <q-card-actions align="center">
          <q-btn label="انصراف" color="warning" v-close-popup/>
          <q-btn label="تایید" color="positive" @click.prevent="deleteItem()"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog transition-show="rotate" transition-hide="rotate" v-model="listCallTrackingDlg">
      <q-card style="width: 900px; max-width: 90vw;">
        <q-card-section>
          <div class="text-h6">{{ listCallTrackingDlgTitle }}</div>
        </q-card-section>
        <q-card-section>
          <q-table
            :loading="loadingCall"
            :rows="rowsCalls"
            :columns="columnsCalls"
            :rows-per-page-options="[10]"
          >

            <template v-slot:header="props">
              <q-tr :props="props">
                <q-th auto-width>
                  <q-btn :to="{ name:'PeyvastCreate',params:{id:callTrackingFocus}}" title="ثبت پیوست" dense
                         color="indigo" icon="add_ic_call"/>
                </q-th>
                <q-th v-for="col in props.cols" :key="col.name" :props="props">
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>

            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td/>
                <q-td key="subject" :props="props">
                  {{ props.row.subject }}
                </q-td>
                <q-td key="dateAndTime" :props="props">
                  {{ props.row.jalali_full_date }}
                </q-td>
                <q-td key="reFollowDate" :props="props">
                  {{ props.row.jalali_re_follow_date }}
                </q-td>
                <q-td key="reFollowSubject" :props="props">
                  {{ props.row.re_follow_subject }}
                </q-td>
                <q-td key="contacted" :props="props">
                  {{ props.row.contacted}}
                </q-td>

                <q-td key="action" :props="props" class="q-gutter-x-sm">
                  <q-btn title="ویرایش" dense color="yellow-9" icon="edit" rounded
                         :to="{ name:'CallEdit',params:{id:props.row.id} }"/>
                  <q-btn title="حذف" dense color="negative" icon="delete" rounded
                         @click.prevent="deleteConfirmation(props.row.id,'call')"/>
                </q-td>
              </q-tr>
            </template>

          </q-table>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showCommentsDlg">
      <q-card style="width: 800px; max-width: 90vw;">
        <q-card-section>

          <q-table
            :loading="commentsLoading"
            binary-state-sort
            :rows="commentsRows"
            title="کامنت ها"

            :columns="commentsColumns"
            :rows-per-page-options="[0]"
          >

            <template v-slot:loading>
              <q-inner-loading showing color="primary"/>
            </template>

            <template v-slot:top-right>
              <q-btn @click="newCommentDlg = true;" title="کامنت جدید" dense color="indigo"
                     icon="eva-plus-outline" round/>
            </template>


            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="user" :props="props">
                  {{ props.row.user }}
                </q-td>
                <q-td key="content" :props="props">
                  {{ props.row.content }}
                </q-td>
                <q-td key="date" :props="props">
                  {{ props.row.created_at }}
                </q-td>
                <q-td key="operation" :props="props">
                  <q-btn title="حذف" dense round color="negative" icon="delete"
                         @click.prevent="deleteCommentConfirmation(props.row.id)"/>
                </q-td>
              </q-tr>
            </template>


          </q-table>

        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="deleteCommentConfirmDialog">
      <q-card>
        <q-card-section class="row items-center">
          <span class="q-mr-sm">آیا از حذف این آیتم اطمینان دارید؟</span>
        </q-card-section>

        <q-card-actions align="center">
          <q-btn label="انصراف" color="warning" v-close-popup/>
          <q-btn label="تایید" color="positive" @click.prevent="deleteCommentItem()"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="newCommentDlg">
      <q-card style="width: 500px; max-width: 90vw;">

        <q-card-section>
          <div class="text-h6 q-mb-lg">کامنت جدید</div>

          <div class="q-gutter-md">


            <q-input
              outlined
              v-model="newCommentContent"
              autogrow/>


          </div>

        </q-card-section>

        <q-card-actions align="center" class="text-primary">
          <q-btn color="negative" label="لغو" v-close-popup/>
          <q-btn color="teal"  @click.prevent="createComment" label="افزودن"/>
        </q-card-actions>

      </q-card>
    </q-dialog>

    <q-dialog v-model="acceptRowDlg">
      <q-card>
        <q-card-section>
          <div style="font-size: 16px" class=" self-md-center">آیا از تایید این تیکت اطمینان دارید؟</div>
        </q-card-section>

        <q-card-actions align="center">
          <q-btn color="yellow-9" label="انصراف" v-close-popup/>
          <q-btn :loading="acceptingMorakhasi" color="positive" label="تایید" @click="acceptTicket()"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showAttachmentsDlg">
      <q-card style="width: 1000px; max-width: 90vw;">
        <q-card-section>

          <q-table
            :loading="attachmentsLoading"
            binary-state-sort
            :rows="attachmentsRows"
            title="پیوست ها"
            :columns="attachmentsColumns"
            :rows-per-page-options="[0]"
          >

            <template v-slot:loading>
              <q-inner-loading showing color="primary"/>
            </template>

            <template v-slot:top-right>
              <q-btn @click="newAttachmentDlg = true;" title="پیوست جدید" dense color="indigo"
                     icon="eva-plus-outline" round/>
            </template>


            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="file" :props="props">
                  <img :src="'https://khrshdyar.ir/file/' + props.row.file" height="50" width="50"
                  @click.prevent="largeImage('https://khrshdyar.ir/file/' + props.row.file)">
                </q-td>
                <q-td key="description" :props="props">
                  {{ props.row.description }}
                </q-td>
                <q-td key="date" :props="props">
                  {{ props.row.jalali_date }}
                </q-td>
                <q-td key="operation" :props="props">
                  <q-btn title="حذف" dense round color="negative" icon="delete"
                         @click.prevent="deleteAttachmentConfirmation(props.row.id)"/>
                </q-td>
              </q-tr>
            </template>


          </q-table>

        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="deleteAttachmentConfirmDialog"
              :maximized="!$q.screen.gt.sm"
              :full-width="!$q.screen.gt.sm"
              :full-height="!$q.screen.gt.sm"
              transition-show="slide-up"
              transition-hide="slide-down">
      <q-card>
        <q-card-section class="row items-center">
          <span class="q-mr-sm">آیا از حذف این آیتم اطمینان دارید؟</span>
        </q-card-section>

        <q-card-actions align="center">
          <q-btn label="انصراف" color="warning" v-close-popup/>
          <q-btn label="تایید" color="positive" @click.prevent="deleteAttachmentItem()"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="newAttachmentDlg"
              :maximized="!$q.screen.gt.sm"
              :full-width="!$q.screen.gt.sm"
              :full-height="!$q.screen.gt.sm"
              transition-show="slide-up"
              transition-hide="slide-down">
      <q-card style="width: 500px; max-width: 90vw;">

        <q-card-section>
          <div class="text-h6 q-mb-lg">پیوست جدید</div>

          <div class="q-gutter-md">


            <q-file
              accept=".jpg, .png, .jpeg, .pdf"
              dir="rtl"
              clearable
              outlined
              label="فایل"
              v-model="newAttachmentFile"
              autogrow/>

            <q-input
              outlined
              label="توضیحات"
              v-model="newAttachmentDescription"
              autogrow/>


          </div>

        </q-card-section>

        <q-card-actions align="center" class="text-primary">
          <q-btn color="negative" label="لغو" v-close-popup/>
          <q-btn color="teal" @click.prevent="createAttachment" label="افزودن"/>
        </q-card-actions>

      </q-card>
    </q-dialog>
    <q-dialog v-model="largeImageDlg"
              :maximized="!$q.screen.gt.sm"
              :full-width="!$q.screen.gt.sm"
              :full-height="!$q.screen.gt.sm"
              transition-show="slide-up"
              transition-hide="slide-down">
      <q-card>
        <q-card-section class="row items-center">
          <img v-if="largeImageAddress !== null" :src="largeImageAddress" width="500" height="500">
        </q-card-section>

        <q-card-actions align="center" class="text-primary">
          <q-btn color="negative" title="بستن" rounded dense icon="eva-close-outline" v-close-popup/>
        </q-card-actions>
      </q-card>
    </q-dialog>


  </q-page>
</template>

<script>
import {exportFile} from 'quasar'
import {api} from 'boot/axios'
import {ref} from "vue";

function wrapCsvValue(val, formatFn) {
  let formatted = formatFn !== void 0
    ? formatFn(val)
    : val
  formatted = formatted === void 0 || formatted === null
    ? ''
    : String(formatted)
  formatted = formatted.split('"').join('""')
  return `"${formatted}"`
}

export default {
  name: "TicketList",
  data() {
    return {
      tab: 'undone',
      done: ref(false),
      date: '',
      title:'',
      user:'',
      time:'',
      comment:'',
      loading: true,
      deleteConfirmDialog: false,
      listCallTrackingDlg: false,
      callTrackingFocus: '',
      listCallTrackingDlgTitle: '',
      showCommentsDlg: false,
      commentsLoading: false,
      acceptRowDlg: false,
      acceptingTicket: false,
      newAttachmentDlg: false,
      newAttachmentDescription: '',
      newAttachmentFile: null,
      attachmentForUUID: '',
      largeImageDlg:false,

      deleteAttachmentConfirmDialog: false,
      showAttachmentsDlg: false,
      attachmentsLoading: false,
      attachmentsRows: [],
      attachmentsColumns: [
        {name: 'file', field: 'file', align: 'center', label: 'فایل'},
        {name: 'description', field: 'description', align: 'center', label: 'توضیحات'},
        {name: 'date', field: 'date', align: 'center', label: 'تاریخ'},
        {name: 'operation', field: 'operation', align: 'center', label: 'عملیات'},
      ],


      commentsRows: [],
      commentsColumns: [
        {name: 'user', field: 'user', align: 'center', label: 'کاربر'},
        {name: 'content', field: 'content', align: 'center', label: 'متن'},
        {name: 'date', field: 'date', align: 'center', label: 'تاریخ'},
        {name: 'operation', field: 'operation', align: 'center', label: 'عملیات'},
      ],
      newCommentDlg: false,
      newCommentContent: '',
      commentForUUID: '',

      deleteCommentConfirmDialog: false,
      itemCommentFocusingId: '',



      columns: [
        {name: 'Done',field: 'Done',align: 'center',label: ''},
        {name: 'sabtKonande', field: 'sabtKonande', align: 'center', label: 'ثبت شده توسط'},
        {name: 'title', field: 'title', align: 'center', label: 'عنوان فعالیت'},
        {name: 'user', field: 'user', align: 'center', label: 'مسئول انجام فعالیت'},
        {name: 'date', field: 'date', align: 'center', label: 'تاریخ و ساعت فعالیت'},
        {name: 'time', field: 'time', align: 'center', label: 'مدت زمان انجام فعالیت'},
        {name: 'comment', field: 'comment', align: 'center', label: 'کامنت'},
        {name: 'action', field: 'action', align: 'center', label: 'عملیات'}
      ],
      columnsDone: [
        {name: 'sabtKonande', field: 'sabtKonande', align: 'center', label: 'ثبت شده توسط'},
        {name: 'title', field: 'title', align: 'center', label: 'عنوان فعالیت'},
        {name: 'user', field: 'user', align: 'center', label: 'مسئول انجام فعالیت'},
        {name: 'date', field: 'date', align: 'center', label: 'تاریخ و ساعت فعالیت'},
        {name: 'time', field: 'time', align: 'center', label: 'مدت زمان انجام فعالیت'},
        {name: 'comment', field: 'comment', align: 'center', label: 'کامنت'},
        {name: 'action', field: 'action', align: 'center', label: 'عملیات'}
      ],

      columnsCalls: [
        {name: 'reFollowDate', align: 'center', label: 'ثبت شده توسط', field: 'reFollowDate'},
        {name: 'reFollowSubject', align: 'center', label: 'تاریخ ثبت', field: 'reFollowSubject'},
        {name: 'contacted', align: 'center', label: 'پیوست', field: 'contacted'},
        {name: 'action', align: 'center', label: 'عملیات', field: 'action'}
      ],

      rows: [],
      rowsCalls: [],
      rowsDone:[],
      rowsDoing:[],
    }
  },
  methods: {
    largeImage(image){
      this.largeImageDlg = true;
      this.largeImageAddress = image;
    },
    createAttachment() {

      let formData = new FormData();
      formData.append('id', this.attachmentForUUID);
      formData.append('file', this.newAttachmentFile);
      formData.append('description', this.newAttachmentDescription);

      api.post('ticket/new-attachment', formData)
        .then(response => {
          this.showAttachments(this.attachmentForUUID)
          this.newAttachmentDlg = false;
          this.newAttachmentDescription = null
          this.newAttachmentFile = null
          this.$q.loading.hide();

          this.$q.notify({
            message: 'باموفقیت ایجاد شد',
            type: 'positive'
          })

          this.getData();
          this.getData2();

        })

    },
    showAttachments(id) {
      this.attachmentForUUID = id;
      this.showAttachmentsDlg = true;
      this.attachmentsLoading = true;
      let formData = new FormData();
      formData.append('id', id);
      api.post('ticket/attachments', formData)
        .then(response => {
          this.attachmentsRows = response.data.data
          this.attachmentsLoading = false
        })
    },
    deleteAttachmentItem() {
      this.attachmentsLoading = true;

      let data = new FormData();
      data.append('id', this.itemAttachmentFocusingId)

      api.post('ticket/attachment/destroy', data)
        .then(response => {
          this.showAttachments(this.attachmentForUUID);
          this.deleteAttachmentConfirmDialog = false;
          this.$q.notify({
            type: 'positive',
            position: 'center',
            message: response.data.message
          })

        })
    },
    deleteAttachmentConfirmation(id) {
      this.deleteAttachmentConfirmDialog = true;
      this.itemAttachmentFocusingId = id;
    },


    createComment() {

      let formData = new FormData();
      formData.append('id', this.commentForUUID);
      formData.append('content', this.newCommentContent);

      api.post('ticket/new-comment', formData)
        .then(response => {
          this.showComments(this.commentForUUID)
          this.newCommentDlg = false;
          this.newCommentContent = ''
          this.$q.loading.hide();
          this.$q.notify({
            message: 'باموفقیت ایجاد شد',
            type: 'positive'
          })
          this.getData();
          this.getData2();

        })
    },
    showComments(id) {
      this.commentForUUID = id;


      this.showCommentsDlg = true;
      this.commentsLoading = true;
      let formData = new FormData();
      formData.append('id', id);
      api.post('ticket/comments', formData)
        .then(response => {
          this.commentsRows = response.data.data
          this.commentsLoading = false
        })
    },
    deleteCommentConfirmation(id) {
      this.deleteCommentConfirmDialog = true;
      this.itemCommentFocusingId = id;
    },
    deleteCommentItem() {
      this.commentsLoading = true;

      let data = new FormData();
      data.append('id', this.itemCommentFocusingId)

      api.post('ticket/comment/destroy', data)
        .then(response => {
          this.showComments(this.commentForUUID);
          this.deleteCommentConfirmDialog = false;
          this.$q.notify({
            type: 'positive',
            position: 'center',
            message: response.data.message
          })
        })
    },

    getData() {
      api.get('ticket/listUndo/0')
        .then(response => {
          this.rows = response.data.data
        })
        .finally(() => {
          this.loading = false
        });
    },
    getData1() {
      api.get('ticket/listDone/1')
        .then(response => {
          this.rowsDone = response.data.data
        })
        .finally(() => {
          this.loading = false
        });
    },
    getData2() {
      api.get('ticket/listDoing/2')
        .then(response => {
          this.rowsDoing = response.data.data
        })
        .finally(() => {
          this.loading = false
        });
    },
    acceptRow(ticket) {
      this.selectedTicket = ticket
      this.acceptRowDlg = true;
    },
    acceptTicket() {
      this.acceptingTicket = true;
      api.get('ticket/accept/' + this.selectedTicket.id)
        .then(response => {
          this.selectedTicket = false;
          this.acceptRowDlg = false;
          this.$q.notify({
            message: 'باموفقیت تایید شد',
            type: 'positive'
          })

          //this.data = this.data.filter(item => item !== this.selectedInvoice)
          this.getData();
          this.getData1();
          this.getData2();
          this.acceptingTicket = false;

        })
    },

    deleteCallItem() {
      this.loadingCall = true;

      let postData = {};
      postData.id = this.itemFocusingId

      api.post('calls/destroy', postData)
        .then(response => {
          this.$q.notify({
            type: 'positive',
            position: 'center',
            message: response.data.message
          })
        })
        .then(() => {
          this.deleteConfirmDialog = false;
          this.loadingCall = false;
        })
        .finally(() => {
          this.getCallData(this.callTrackingFocus);
        });
    },

    callTracking(customerId, customerName) {
      this.listCallTrackingDlg = true;
      this.callTrackingFocus = customerId;

      this.getCallData(customerId);

    },

    deleteConfirmation(id) {
      this.deleteConfirmDialog = true;
      this.itemFocusingId = id;
    },
    deleteItem() {
      this.loading = true;

      let postData = {};
      postData.id = this.itemFocusingId

      api.post('ticket/destroy', postData)
        .then(response => {
          this.$q.notify({
            type: 'positive',
            position: 'center',
            message: response.data.message
          })
        })
        .then(() => {
          this.getData();
        })
        .finally(() => {
          this.deleteConfirmDialog = false;
          this.loading=false;
        });
    },


  },
  created() {

    this.getData(),
    this.getData1(),
    this.getData2()
  }

}

</script>

<style scoped>

</style>
