import { useState, useEffect } from "react";
import { Dialog, DialogHeader, DialogBody, DialogFooter, Button, Input, Radio, } from "@material-tailwind/react";
import { useFormik } from "formik";
import * as Yup from "yup";
import moment from "moment";
import { MdVisibility, MdEdit, MdDelete, } from "react-icons/md";
import axios from 'axios';
import { Header } from "../components/Header";
import Footer from "../components/Footer";

const API_URL = "https://jsonplaceholder.typicode.com/users";

const validationSchema = Yup.object({
  name: Yup.string().required("Nama wajib diisi"),
  address: Yup.string().required("Alamat wajib diisi"),
  gender: Yup.string().required("Jenis kelamin wajib diisi"),
  birthDate: Yup.date().required("Tanggal lahir wajib diisi"),
});

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      const formattedUsers = response.data.slice(0, 10).map(user => ({
        id: user.id,
        name: user.name,
        address: user.address?.street || "Tidak Ada Alamat",
        gender: Math.random() > 0.5 ? "P" : "W",
        birthDate: moment().subtract(Math.floor(Math.random() * 30), "years").format("YYYY-MM-DD"),
        createdAt: new Date().toISOString(),
      }));
      setUsers(formattedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
    setLoading(false);
  };

  const formik = useFormik({
    initialValues: { name: "", address: "", gender: "P", birthDate: "" },
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      if (selectedUser) {
        setUsers(users.map(u => (u.id === selectedUser.id ? { ...values, id: selectedUser.id, createdAt: selectedUser.createdAt } : u)));
        showNotification("Data berhasil diperbarui!");
      } else {
        setUsers([...users, { ...values, id: Date.now(), createdAt: new Date().toISOString() }]);
        showNotification("Data berhasil ditambahkan!");
      }
      resetForm();
      setSelectedUser(null);
      setOpen(false);
    },
  });
  const handleOpen = () => {
    setOpen(true);
    setSelectedUser(null);
    formik.resetForm();
  };
  const handleDelete = (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus user ini?")) {
      setUsers(users.filter(user => user.id !== id));
      showNotification("Data berhasil dihapus!");
    }
  };

  // d

  return (
    <div className="h-full w-full ">
      <Header />
      {loading && <div className="h-[800px] flex items-center justify-center">
            <h6 className='text-xl'>Loading....</h6>
        </div>}
      {notification && (
        <div className="fixed top-5 right-5 bg-green-500 text-white p-3 rounded">{notification}</div>
      )}

      {
        !loading && (
          <div className="flex justify-center xl:my-20">
            <div className='w-10/12'>
              <div className='flex flex-row justify-between items-center my-6'>
                <h6 className='text-xl font-bold text-slate-800'>Tabel Daftar User</h6>
                <Button color="blue" onClick={() => { handleOpen() }}>Tambah User</Button>
              </div>
              <div className='w-full overflow-auto'>
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border p-2">Nama</th>
                      <th className="border p-2">Alamat</th>
                      <th className="border p-2">Jenis Kelamin</th>
                      <th className="border p-2">Tanggal Lahir</th>
                      <th className="border p-2">Tanggal Input</th>
                      <th className="border p-2">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length > 0 ? users.map(user => (
                      <tr key={user.id} className="text-center">
                        <td className="border p-2">{user.name}</td>
                        <td className="border p-2">{user.address}</td>
                        <td className="border p-2">{user.gender}</td>
                        <td className="border p-2">{moment(user.birthDate).format("DD MM YYYY")}</td>
                        {/*  HH:mm:ss */}
                        <td className="border p-2">{moment(user.createdAt).format("DD MM YY HH MM SS")}</td>
                        <td className="border p-2 space-x-2">
                          <Button color="blue" onClick={() => { setSelectedUser(user); setViewOpen(true); }}><MdVisibility /></Button>
                          <Button color="yellow" onClick={() => { setOpen(true); setSelectedUser(user); formik.setValues(user); }}><MdEdit /></Button>
                          <Button color="red" onClick={() => handleDelete(user.id)}><MdDelete /></Button>
                        </td>
                      </tr>
                    )) : <tr><td colSpan="6" className="text-center p-4">Tidak ada data</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      }
      {!loading && (<Footer />)}



      {/* Modal Form Input */}
      <Dialog open={open} handler={() => setOpen(false)}>
        <DialogHeader>{selectedUser ? "Edit User" : "Tambah User"}</DialogHeader>
        <DialogBody>
          <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
            <Input label="Nama" name="name" {...formik.getFieldProps("name")} />
            {formik.touched.name && formik.errors.name && <p className="text-red-500">{formik.errors.name}</p>}
            
            <Input label="Alamat" name="address" {...formik.getFieldProps("address")} />
            {formik.touched.address && formik.errors.address && <p className="text-red-500">{formik.errors.address}</p>}
            
            <div className="flex gap-4">
              <Radio name="gender" label="Pria" value="P" onChange={formik.handleChange} checked={formik.values.gender === "P"} />
              <Radio name="gender" label="Wanita" value="W" onChange={formik.handleChange} checked={formik.values.gender === "W"} />
              {formik.touched.gender && formik.errors.gender && <p className="text-red-500">{formik.errors.gender}</p>}
            </div>

            <Input type="date" label="Tanggal Lahir" name="birthDate" {...formik.getFieldProps("birthDate")} />
            {formik.touched.birthDate && formik.errors.birthDate && <p className="text-red-500">{formik.errors.birthDate}</p>}
          </form>
        </DialogBody>
        <DialogFooter>
          <Button color="green" onClick={formik.handleSubmit}>Simpan</Button>
        </DialogFooter>
      </Dialog>

      {/* Modal View User */}
      {selectedUser && (
        <Dialog open={viewOpen} handler={() => setViewOpen(false)}>
          <DialogHeader>Detail User</DialogHeader>
          <DialogBody>
            <p><strong>Nama:</strong> {selectedUser.name}</p>
            <p><strong>Alamat:</strong> {selectedUser.address}</p>
            <p><strong>Jenis Kelamin:</strong> {selectedUser.gender}</p>
            <p><strong>Tanggal Lahir:</strong> {moment(selectedUser.birthDate).format("DD MM YYYY")}</p>
            <p><strong>Tanggal Input:</strong> {moment(selectedUser.createdAt).format("DD MM YY HH MM SS")}</p>
          </DialogBody>
          <DialogFooter>
            <Button color="gray" onClick={() => setViewOpen(false)}>Tutup</Button>
          </DialogFooter>
        </Dialog>
      )}
    </div>
  );
}
