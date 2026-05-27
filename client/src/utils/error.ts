import { AxiosError } from 'axios'

export const getErrorMessage = (err: unknown, fallback = 'Có lỗi xảy ra. Vui lòng thử lại.'): string => {
    if (err instanceof AxiosError) {
        return err.response?.data?.message || fallback
    }
    return fallback
}