<?php

use App\Http\Controllers\AdminApiController;
use App\Http\Controllers\ToeflApiController;
use Illuminate\Support\Facades\Route;

Route::middleware('web')->group(function () {
    Route::get('/settings', [ToeflApiController::class, 'settings']);
    Route::get('/branding', [ToeflApiController::class, 'branding']);
    Route::get('/auth/user-me', [ToeflApiController::class, 'me']);
    Route::post('/auth/register', [ToeflApiController::class, 'register'])->middleware('throttle:6,1');
    Route::post('/auth/user-login', [ToeflApiController::class, 'login'])->middleware('throttle:6,1');
    Route::post('/auth/user-logout', [ToeflApiController::class, 'logout']);
    Route::post('/auth/token', [ToeflApiController::class, 'tokenLogin'])->middleware('throttle:10,1');

    Route::get('/student/dashboard', [ToeflApiController::class, 'studentDashboard']);
    Route::get('/student/schedules', [ToeflApiController::class, 'schedules']);
    Route::post('/student/enroll', [ToeflApiController::class, 'enroll']);
    Route::post('/student/payment-proof', [ToeflApiController::class, 'paymentProof']);
    Route::get('/student/payment-proof/{registrationId}', [ToeflApiController::class, 'viewPaymentProof']);
    Route::post('/student/start-exam', [ToeflApiController::class, 'startExam']);

    Route::get('/exam/{sessionId}', [ToeflApiController::class, 'exam']);
    Route::post('/exam/answer', [ToeflApiController::class, 'answer']);
    Route::post('/exam/transition', [ToeflApiController::class, 'transition']);
    Route::post('/exam/violation', [ToeflApiController::class, 'violation']);
    Route::post('/exam/submit', [ToeflApiController::class, 'submit']);
    Route::get('/result/{sessionId}', [ToeflApiController::class, 'result']);

    Route::post('/demo/start', [ToeflApiController::class, 'demoStart'])->middleware('throttle:10,1');
    Route::post('/demo/submit', [ToeflApiController::class, 'demoSubmit']);
    Route::get('/demo/result/{demoId}', [ToeflApiController::class, 'demoResult']);
    Route::get('/certificate/{verificationCode}', [ToeflApiController::class, 'certificate']);

    Route::post('/admin/auth/login', [AdminApiController::class, 'login'])->middleware('throttle:6,1');
    Route::post('/admin/auth/logout', [AdminApiController::class, 'logout']);
    Route::get('/admin/auth/me', [AdminApiController::class, 'me']);
    Route::get('/admin/sessions', [AdminApiController::class, 'sessions']);
    Route::get('/admin/backups', [AdminApiController::class, 'backups']);
    Route::post('/admin/backups', [AdminApiController::class, 'createBackup']);
    Route::post('/admin/backups/restore-upload', [AdminApiController::class, 'restoreUploadedBackup']);
    Route::get('/admin/backups/{filename}/download', [AdminApiController::class, 'downloadBackup']);
    Route::post('/admin/backups/{filename}/restore', [AdminApiController::class, 'restoreBackup']);
    Route::delete('/admin/backups/{filename}', [AdminApiController::class, 'deleteBackup']);
    Route::match(['get', 'post'], '/admin/packages', [AdminApiController::class, 'packages']);
    Route::post('/admin/packages/parse-file', [AdminApiController::class, 'parseFile']);
    Route::get('/admin/packages/template', [AdminApiController::class, 'template']);
    Route::get('/admin/packages/template-excel', [AdminApiController::class, 'templateExcel']);
    Route::get('/admin/packages/{packageId}/export', [AdminApiController::class, 'packageExport']);
    Route::get('/admin/packages/{packageId}/detail', [AdminApiController::class, 'packageDetail']);
    Route::put('/admin/packages/{packageId}/toggle', [AdminApiController::class, 'togglePackage']);
    Route::delete('/admin/packages/{packageId}', [AdminApiController::class, 'deletePackage']);
    Route::match(['get', 'post'], '/admin/tokens', [AdminApiController::class, 'tokens']);
    Route::match(['get', 'post', 'patch', 'delete'], '/admin/schedules', [AdminApiController::class, 'schedules']);
    Route::get('/admin/payments', [AdminApiController::class, 'payments']);
    Route::patch('/admin/payments/{registrationId}', [AdminApiController::class, 'paymentAction']);
    Route::get('/admin/payments/{registrationId}/proof', [AdminApiController::class, 'paymentProof']);
    Route::match(['get', 'delete'], '/admin/leads', [AdminApiController::class, 'leads']);
    Route::get('/admin/certificates', [AdminApiController::class, 'certificates']);
    Route::get('/admin/export/results', [AdminApiController::class, 'exportResults']);
    Route::get('/admin/export/leads', [AdminApiController::class, 'exportLeads']);
    Route::match(['get', 'put'], '/admin/settings', [AdminApiController::class, 'settings']);
    Route::match(['get', 'post'], '/admin/settings/institution', [AdminApiController::class, 'institutionSettings']);
    Route::post('/admin/settings/upload', [AdminApiController::class, 'uploadInstitutionAsset']);
    Route::put('/admin/questions/{questionId}', [AdminApiController::class, 'question']);
    Route::put('/admin/passages/{passageId}', [AdminApiController::class, 'passage']);
    Route::post('/admin/upload-audio', [AdminApiController::class, 'uploadAudio']);
});
